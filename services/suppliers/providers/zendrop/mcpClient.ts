// Minimal MCP (Model Context Protocol) client over the Streamable HTTP
// transport — a single POST endpoint accepting JSON-RPC 2.0 messages. Used
// to talk to Zendrop's official MCP server rather than a scraped or
// guessed REST surface (Part 6).
//
// This environment could not fetch Zendrop's MCP tool reference live (the
// domain is blocked by network policy here), so exact tool names/argument
// shapes are discovered at runtime via the standard MCP `tools/list`
// method rather than hardcoded — that's what makes this a genuine
// "official MCP integration" rather than a guess: whatever Zendrop's
// server actually advertises is what gets called.

import { SupplierProviderError } from "../../supplierProvider";

export interface McpTool {
  name: string;
  description?: string;
  inputSchema?: { properties?: Record<string, unknown>; required?: string[] };
}

interface JsonRpcResponse<T> {
  jsonrpc: "2.0";
  id: number | string;
  result?: T;
  error?: { code: number; message: string };
}

export class McpHttpClient {
  private sessionId: string | null = null;
  private nextId = 1;
  private initialized = false;

  constructor(
    private endpoint: string,
    private authHeader: Record<string, string>,
    private providerKey: string,
  ) {}

  private async rpc<T>(method: string, params?: unknown): Promise<T> {
    const id = this.nextId++;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      ...this.authHeader,
    };
    if (this.sessionId) headers["Mcp-Session-Id"] = this.sessionId;

    let res: Response;
    try {
      res = await fetch(this.endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
      });
    } catch (err) {
      throw new SupplierProviderError(this.providerKey, `Network error calling MCP method ${method}: ${String(err)}`);
    }

    const sessionHeader = res.headers.get("Mcp-Session-Id");
    if (sessionHeader) this.sessionId = sessionHeader;

    if (!res.ok) {
      throw new SupplierProviderError(this.providerKey, `MCP ${method} returned HTTP ${res.status}: ${await safeText(res)}`);
    }

    const body = (await parseMcpBody(res)) as JsonRpcResponse<T>;
    if (body.error) {
      throw new SupplierProviderError(this.providerKey, `MCP ${method} error ${body.error.code}: ${body.error.message}`);
    }
    if (body.result === undefined) {
      throw new SupplierProviderError(this.providerKey, `MCP ${method} returned no result`);
    }
    return body.result;
  }

  private async ensureInitialized() {
    if (this.initialized) return;
    await this.rpc("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "bullrush-internal-agent", version: "0.2.0" },
    });
    this.initialized = true;
  }

  async listTools(): Promise<McpTool[]> {
    await this.ensureInitialized();
    const result = await this.rpc<{ tools: McpTool[] }>("tools/list");
    return result.tools ?? [];
  }

  async callTool<T = unknown>(name: string, args: Record<string, unknown>): Promise<T> {
    await this.ensureInitialized();
    const result = await this.rpc<{ content?: unknown; structuredContent?: T; isError?: boolean }>("tools/call", {
      name,
      arguments: args,
    });
    if (result.structuredContent !== undefined) return result.structuredContent;
    return result.content as T;
  }
}

/** Finds the tool whose name/description best matches every keyword given. */
export function findTool(tools: McpTool[], mustIncludeAll: string[]): McpTool | undefined {
  return tools.find((tool) => {
    const haystack = `${tool.name} ${tool.description ?? ""}`.toLowerCase();
    return mustIncludeAll.every((kw) => haystack.includes(kw));
  });
}

/** Picks the first property name present in a tool's input schema from a list of candidates. */
export function pickSchemaProperty(tool: McpTool, candidates: string[]): string | undefined {
  const properties = tool.inputSchema?.properties ?? {};
  return candidates.find((c) => c in properties);
}

async function parseMcpBody(res: Response): Promise<unknown> {
  const contentType = res.headers.get("Content-Type") ?? "";
  if (contentType.includes("text/event-stream")) {
    // Streamable HTTP may respond with a short SSE stream containing one
    // "data: {...}" JSON-RPC message — take the last data line.
    const text = await res.text();
    const lines = text.split("\n").filter((l) => l.startsWith("data:"));
    const last = lines[lines.length - 1];
    return last ? JSON.parse(last.slice(5).trim()) : {};
  }
  return res.json();
}

async function safeText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 500);
  } catch {
    return "<no body>";
  }
}
