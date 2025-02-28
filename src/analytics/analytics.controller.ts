import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze a single email' })
  async analyzeEmail(
    @Body()
    emailContent: {
      subject: string;
      body: string;
      from: string;
      date: string;
    },
  ) {
    try {
      const analysis = await this.analyticsService.analyzeEmail(emailContent);
      return { success: true, data: analysis };
    } catch (error) {
      throw new BadRequestException(
        `Failed to analyze email: ${error.message}`,
      );
    }
  }

  @Post('batch-analyze')
  @ApiOperation({ summary: 'Analyze multiple emails' })
  async batchAnalyzeEmails(
    @Body()
    emails: Array<{
      subject: string;
      body: string;
      from: string;
      date: string;
    }>,
  ) {
    if (!Array.isArray(emails) || emails.length === 0) {
      throw new BadRequestException('Invalid or empty email array');
    }

    try {
      const analyses = await this.analyticsService.batchAnalyzeEmails(emails);
      return { success: true, data: analyses };
    } catch (error) {
      throw new BadRequestException(
        `Failed to analyze emails: ${error.message}`,
      );
    }
  }

  @Get('config')
  @ApiOperation({ summary: 'Get current LLM configuration' })
  getLLMConfig() {
    return {
      success: true,
      data: {
        provider: process.env.LLM_PROVIDER || 'openai',
        model:
          process.env.LLM_MODEL ||
          (process.env.LLM_PROVIDER === 'openrouter'
            ? 'anthropic/claude-3-opus'
            : 'gpt-4-turbo-preview'),
        baseUrl: process.env.LLM_BASE_URL,
      },
    };
  }
}
