import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { MCPClientLogger } from "./logger";
import { ListToolsResponse, McpRequestMessage, ServerConfig } from "./types";
import { z } from "zod";

const logger = new MCPClientLogger();

/**
 * Create and connect an MCP client for a given server.
 */
export async function createClient(
  id: string,
  config: ServerConfig
): Promise<Client> {
  logger.info(`Starting Web4 MCP server client "${id}"...`);

  const sanitizedEnv = {
    ...Object.fromEntries(
      Object.entries(process.env)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, v as string])
    ),
    ...(config.env ?? {})
  };

  const transport = new StdioClientTransport({
    command: config.command,
    args: config.args,
    env: sanitizedEnv,
  });

  const client = new Client(
    {
      name: `web4-mcp-client-${id}`,
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  await client.connect(transport);
  logger.info(`Web4 MCP client "${id}" connected.`);

  return client;
}

/**
 * Safely close the MCP client.
 */
export async function removeClient(client: Client): Promise<void> {
  logger.info("Closing Web4 MCP client...");
  await client.close();
}

/**
 * List tools exposed by the MCP server.
 */
export async function listTools(client: Client): Promise<ListToolsResponse> {
  logger.info("Fetching list of tools from Web4 MCP server...");
  return client.listTools();
}

/**
 * Execute an MCP tool request.
 */
export async function executeRequest(
  client: Client,
  request: McpRequestMessage
) {
  logger.info(`Executing request on Web4 MCP server: ${request.method}`);
  return client.request(request, z.any());
}
