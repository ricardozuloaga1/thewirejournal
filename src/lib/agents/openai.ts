/**
 * OpenAI Client Configuration
 */

import OpenAI from 'openai';

// Lazy initialization to avoid issues during build
let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

/**
 * Generate text using GPT-4
 */
export async function generateText(
  systemPrompt: string,
  userPrompt: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  const client = getOpenAIClient();
  
  const response = await client.chat.completions.create({
    model: options?.model || 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 4000,
  });

  return response.choices[0]?.message?.content || '';
}

/**
 * Generate text with JSON output
 */
export async function generateJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  options?: {
    model?: string;
    temperature?: number;
  }
): Promise<T> {
  const client = getOpenAIClient();
  
  const response = await client.chat.completions.create({
    model: options?.model || 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt + '\n\nRespond ONLY with valid JSON, no markdown or other text.' },
      { role: 'user', content: userPrompt },
    ],
    temperature: options?.temperature ?? 0.3,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content || '{}';
  return JSON.parse(content) as T;
}


