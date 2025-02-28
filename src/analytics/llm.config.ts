export interface LLMConfig {
  provider: 'openai' | 'custom';
  apiKey: string;
  baseUrl?: string;
  model: string;
}

export interface LLMResponse {
  type: string;
  sentiment: string;
  summary: string;
  actionRequired: boolean;
  importance: number;
  category: string;
}

export const defaultModels = {
  openai: 'gpt-4-turbo-preview',
  custom: '',
};
