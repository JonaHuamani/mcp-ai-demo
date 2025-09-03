import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai/ai.service';

@Controller('ui')
export class UiController {
  constructor(private readonly ai: AiService) {}

  @Post('plan')
  async plan(
    @Body() body: { route?: string; signals?: Record<string, unknown> },
  ) {
    return this.ai.generateUiPlan(body);
  }
}
