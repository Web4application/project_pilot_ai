import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { MCPClientLogger } from "./logger";
import { ListToolsResponse, McpRequestMessage, ServerConfig } from "./types";
import { z } from "zod";

const logger = new MCPClientLogger();

/**
 * Create an MCP Client instance
 */
export async function createClient(
  id: string,
  config: ServerConfig,
): Promise<Client> {
  logger.info(`Creating MCP client [${id}]...`);

  const transport = new StdioClientTransport({
    command: config.command,
    args: config.args,
    env: {
      // keep system env vars
      ...Object.fromEntries(
        Object.entries(process.env)
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => [k, v as string]),
      ),

      // merge user-defined MCP env vars
      ...(config.env || {}),
    },
  });

  // Updated name → web4-mcp-client
  const client = new Client(
    {
      name: `web4-mcp-client-${id}`,
      version: "1.0.0",
    },
    {
      capabilities: {},
    },
  );

  await client.connect(transport);
  return client;
}

/**
 * Close and remove an MCP client
 */
export async function removeClient(client: Client) {
  logger.info(`Closing MCP client...`);
  await client.close();
}

/**
 * List available tools for the client
 */
export async function listTools(client: Client): Promise<ListToolsResponse> {
  return client.listTools();
}

/**
 * Execute a request on an MCP server
 */
export async function executeRequest(
  client: Client,
  request: McpRequestMessage,
) {
  return client.request(request, z.any());
}
