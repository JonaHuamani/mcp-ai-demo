import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './ai/ai.module';
import { UiController } from './ui.controller';
import { McpModule } from './mcp/mcp.module';
import { StrapiService } from './strapi/strapi.service';
import { DevController } from './dev/dev.controller';

@Module({
  imports: [AiModule, McpModule],
  controllers: [AppController, UiController, DevController],
  providers: [AppService, StrapiService],
})
export class AppModule {}
