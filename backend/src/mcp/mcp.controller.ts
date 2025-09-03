import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { McpService } from './mcp.service';

interface JsonRpcRequest {
  jsonrpc: string;
  id: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

@Controller('mcp')
export class McpController {
  constructor(private readonly mcp: McpService) {}

  @Get('health')
  health() {
    return { status: 'ok', server: 'mcp-ready' };
  }

  @Post()
  async rpc(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: JsonRpcRequest,
  ) {
    console.log(
      '[MCP Controller] Received request:',
      JSON.stringify(body, null, 2),
    );
    try {
      // Passthrough al transporte MCP (responde él mismo)
      await this.mcp.handleHttp(req, res, body);
    } catch (error) {
      console.error('[MCP Controller] Error:', error);
      res.status(500).json({ error: 'MCP transport error' });
    }
  }
}
