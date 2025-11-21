"use server";

import fs from "fs/promises";
import path from "path";
import {
  createClient,
  executeRequest,
  listTools,
  removeClient,
} from "./client";

import { MCPClientLogger } from "./logger";
import {
  DEFAULT_MCP_CONFIG,
  McpClientData,
  McpConfigData,
  McpRequestMessage,
  ServerConfig,
  ServerStatusResponse,
} from "./types";

import { getServerSideConfig } from "../config/server";

const logger = new MCPClientLogger("MCP Actions");
const CONFIG_PATH = path.join(process.cwd(), "app/mcp/mcp_config.json");

// In‑memory client session store
const clientsMap = new Map<string, McpClientData>();

/* -------------------------------------------------------
 * Helpers
 * ----------------------------------------------------- */

async function loadConfig(): Promise<McpConfigData> {
  try {
    const data = await fs.readFile(CONFIG_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    logger.error(`Failed to load MCP config → using default: ${err}`);
    return DEFAULT_MCP_CONFIG;
  }
}

async function saveConfig(config: McpConfigData) {
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function setClientInitState(clientId: string) {
  clientsMap.set(clientId, {
    client: null,
    tools: null,
    errorMsg: null,
  });
}

function setClientError(clientId: string, error: unknown) {
  clientsMap.set(clientId, {
    client: null,
    tools: null,
    errorMsg: error instanceof Error ? error.message : String(error),
  });
}

/* -------------------------------------------------------
 * Client Initialization
 * ----------------------------------------------------- */

async function initializeClient(clientId: string, config: ServerConfig) {
  if (config.status === "paused") {
    logger.info(`Skipping paused client [${clientId}]`);
    return;
  }

  logger.info(`Initializing MCP client [${clientId}]`);
  setClientInitState(clientId);

  try {
    const client = await createClient(clientId, config);
    const tools = await listTools(client);

    clientsMap.set(clientId, { client, tools, errorMsg: null });
    logger.success(`Client [${clientId}] initialized`);
  } catch (err) {
    setClientError(clientId, err);
    logger.error(`Client [${clientId}] init failed → ${err}`);
  }
}

/* -------------------------------------------------------
 * Public API
 * ----------------------------------------------------- */

export async function initializeMcpSystem() {
  logger.info("Starting MCP system...");

  if (clientsMap.size > 0) {
    logger.info("Already initialized → skipping");
    return;
  }

  const config = await loadConfig();
  for (const [id, server] of Object.entries(config.mcpServers)) {
    await initializeClient(id, server);
  }

  return config;
}

export async function getClientsStatus(): Promise<
  Record<string, ServerStatusResponse>
> {
  const config = await loadConfig();
  const result: Record<string, ServerStatusResponse> = {};

  for (const id of Object.keys(config.mcpServers)) {
    const server = config.mcpServers[id];
    const local = clientsMap.get(id);

    if (server.status === "paused") {
      result[id] = { status: "paused", errorMsg: null };
      continue;
    }

    if (!local) {
      result[id] = { status: "undefined", errorMsg: null };
      continue;
    }

    if (local.errorMsg) {
      result[id] = { status: "error", errorMsg: local.errorMsg };
      continue;
    }

    if (local.client) {
      result[id] = { status: "active", errorMsg: null };
      continue;
    }

    result[id] = { status: "initializing", errorMsg: null };
  }

  return result;
}

export async function addMcpServer(clientId: string, config: ServerConfig) {
  const current = await loadConfig();
  const isNew = !(clientId in current.mcpServers);

  if (isNew && !config.status) config.status = "active";

  const newConfig = {
    ...current,
    mcpServers: { ...current.mcpServers, [clientId]: config },
  };

  await saveConfig(newConfig);

  if (isNew || config.status === "active") {
    await initializeClient(clientId, config);
  }

  return newConfig;
}

export async function pauseMcpServer(clientId: string) {
  const current = await loadConfig();
  const target = current.mcpServers[clientId];

  if (!target) throw new Error(`Server ${clientId} not found`);

  const updated: McpConfigData = {
    ...current,
    mcpServers: {
      ...current.mcpServers,
      [clientId]: { ...target, status: "paused" },
    },
  };

  await saveConfig(updated);

  const local = clientsMap.get(clientId);
  if (local?.client) await removeClient(local.client);

  clientsMap.delete(clientId);

  return updated;
}

export async function resumeMcpServer(clientId: string) {
  const current = await loadConfig();
  const cfg = current.mcpServers[clientId];

  if (!cfg) throw new Error(`Server ${clientId} not found`);

  try {
    await initializeClient(clientId, cfg);

    const updated = {
      ...current,
      mcpServers: {
        ...current.mcpServers,
        [clientId]: { ...cfg, status: "active" },
      },
    };

    await saveConfig(updated);
  } catch (err) {
    cfg.status = "error";
    await saveConfig(current);
    throw err;
  }
}

export async function removeMcpServer(clientId: string) {
  const current = await loadConfig();
  const { [clientId]: removed, ...rest } = current.mcpServers;

  const updated = { ...current, mcpServers: rest };
  await saveConfig(updated);

  const local = clientsMap.get(clientId);
  if (local?.client) await removeClient(local.client);

  clientsMap.delete(clientId);

  return updated;
}

export async function restartAllClients() {
  logger.info("Restarting all MCP clients...");

  for (const local of clientsMap.values()) {
    if (local.client) await removeClient(local.client);
  }

  clientsMap.clear();

  const config = await loadConfig();
  for (const [id, cfg] of Object.entries(config.mcpServers)) {
    await initializeClient(id, cfg);
  }

  return config;
}

export async function executeMcpAction(
  clientId: string,
  request: McpRequestMessage,
) {
  const local = clientsMap.get(clientId);

  if (!local?.client) {
    throw new Error(`Client ${clientId} not found or inactive`);
  }

  return executeRequest(local.client, request);
}

export async function getAllTools() {
  return [...clientsMap.entries()].map(([id, data]) => ({
    clientId: id,
    tools: data.tools,
  }));
}

export async function getAvailableClientsCount() {
  return [...clientsMap.values()].filter((v) => !v.errorMsg).length;
}

export async function isMcpEnabled() {
  try {
    return getServerSideConfig().enableMcp;
  } catch (err) {
    logger.error(`MCP enable check failed: ${err}`);
    return false;
  }
}
