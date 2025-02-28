import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMConfig, LLMResponse, defaultModels } from './llm.config';
import OpenAI from 'openai';
import axios from 'axios';

@Injectable()
export class AnalyticsService {
  private llmConfig: LLMConfig;

  constructor(private configService: ConfigService) {
    const provider =
      this.configService.get<'openai' | 'custom'>('LLM_PROVIDER') || 'openai';
    const apiKey =
      provider === 'openai'
        ? this.configService.get('OPENAI_API_KEY')
        : this.configService.get('LLM_API_KEY');

    if (!apiKey) {
      throw new Error(`API key not found for provider: ${provider}`);
    }

    this.llmConfig = {
      provider,
      apiKey,
      baseUrl: this.configService.get('LLM_BASE_URL'),
      model:
        this.configService.get('LLM_MODEL') ||
        defaultModels[provider] ||
        defaultModels.openai,
    };
  }

  async analyzeEmail(emailContent: {
    subject: string;
    body: string;
    from: string;
    date: string;
  }): Promise<LLMResponse> {
    const prompt = `Analyze this email and provide structured information:
Subject: ${emailContent.subject}
From: ${emailContent.from}
Date: ${emailContent.date}
Body: ${emailContent.body}

Provide a response in this exact JSON format:
{
  "type": "Type of email (promotional, personal, business, newsletter, etc.)",
  "sentiment": "Overall sentiment (positive, negative, neutral)",
  "summary": "Brief summary of the content",
  "actionRequired": true/false,
  "importance": "Number 1-5, where 5 is highest priority",
  "category": "Specific category for organization"
}`;

    if (this.llmConfig.provider === 'openai') {
      return this.analyzeWithOpenAI(prompt);
    } else if (this.llmConfig.provider === 'custom') {
      return this.analyzeWithCustomProvider(prompt);
    } else {
      throw new Error('Unsupported LLM provider');
    }
  }

  private async analyzeWithOpenAI(prompt: string): Promise<LLMResponse> {
    const openai = new OpenAI({
      apiKey: this.llmConfig.apiKey,
      baseURL: this.llmConfig.baseUrl,
    });

    const response = await openai.chat.completions.create({
      model: this.llmConfig.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  private async analyzeWithCustomProvider(
    prompt: string,
  ): Promise<LLMResponse> {
    if (!this.llmConfig.baseUrl) {
      throw new Error('Base URL required for custom LLM provider');
    }

    const response = await axios.post(
      this.llmConfig.baseUrl,
      {
        model: this.llmConfig.model,
        prompt,
      },
      {
        headers: {
          Authorization: `Bearer ${this.llmConfig.apiKey}`,
        },
      },
    );

    return response.data;
  }

  async batchAnalyzeEmails(
    emails: Array<{
      subject: string;
      body: string;
      from: string;
      date: string;
    }>,
  ): Promise<LLMResponse[]> {
    return Promise.all(emails.map((email) => this.analyzeEmail(email)));
  }
}
