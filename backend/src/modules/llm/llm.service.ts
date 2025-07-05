import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { ParsedEmail } from '../../utils/types';
import axios from 'axios';

export interface LLMAnalysisResult {
  provider: string;
  model: string;
  is_spam: boolean;
  confidence: number;
  reasoning: string;
  risk_factors: string[];
  response_time_ms: number;
  error?: string;
}

@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);

  constructor(private readonly configService: ConfigService) {}

  async analyzeEmail(
    parsedEmail: ParsedEmail,
  ): Promise<LLMAnalysisResult | null> {
    const config = this.configService.getConfig();

    this.logger.debug('Starting LLM analysis...');
    this.logger.debug(`Config has LLM providers: ${!!config.llm?.providers}`);

    if (!config.llm?.providers) {
      this.logger.debug('LLM providers not configured');
      return null;
    }

    // Trova il primo provider abilitato
    const enabledProvider = this.getEnabledProvider(config.llm.providers);
    if (!enabledProvider) {
      this.logger.warn('No LLM provider enabled');
      return null;
    }

    this.logger.debug(`Using provider: ${enabledProvider.name} with model: ${enabledProvider.config.model}`);

    const startTime = Date.now();

    try {
      const emailContent = this.prepareEmailContent(parsedEmail);
      this.logger.debug(`Prepared email content (${emailContent.length} characters)`);
      
      const result = await this.callLLMProvider(
        enabledProvider,
        emailContent,
        config.llm.prompts?.spam_analysis || '',
      );

      const responseTime = Date.now() - startTime;
      this.logger.debug(`LLM analysis completed in ${responseTime}ms`);
      this.logger.debug(`Result: ${JSON.stringify(result)}`);

      return {
        ...result,
        response_time_ms: responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error(`LLM analysis failed: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);

      return {
        provider: enabledProvider.name,
        model: enabledProvider.config.model,
        is_spam: false,
        confidence: 0,
        reasoning: 'LLM analysis failed',
        risk_factors: [],
        response_time_ms: responseTime,
        error: error.message,
      };
    }
  }

  private getEnabledProvider(
    providers: any,
  ): { name: string; config: any } | null {
    for (const [name, config] of Object.entries(providers)) {
      if ((config as any).enabled) {
        return { name, config };
      }
    }
    return null;
  }

  private prepareEmailContent(parsedEmail: ParsedEmail): string {
    const subject = parsedEmail.metadata?.subject || 'No subject';
    const from = parsedEmail.metadata?.from || 'Unknown sender';
    const to = parsedEmail.metadata?.to || 'Unknown recipient';
    const plainText = parsedEmail.plainText || '';
    const htmlText = parsedEmail.htmlText || '';

    // Taglia il contenuto se troppo lungo (per evitare token limits)
    const maxLength = 4000;
    const content = plainText || htmlText.replace(/<[^>]*>/g, ''); // Strip HTML se non c'è plain text
    const truncatedContent =
      content.length > maxLength
        ? content.substring(0, maxLength) + '...[TRUNCATED]'
        : content;

    return `EMAIL TO ANALYZE:

Subject: ${subject}
From: ${from}
To: ${to}

Content:
${truncatedContent}

---
Please analyze this email for spam/phishing indicators.`;
  }

  private async callLLMProvider(
    provider: { name: string; config: any },
    emailContent: string,
    prompt: string,
  ): Promise<Omit<LLMAnalysisResult, 'response_time_ms'>> {
    const { name, config } = provider;

    switch (name) {
      case 'openai':
        return this.callOpenAI(config, emailContent, prompt);
      case 'anthropic':
        return this.callAnthropic(config, emailContent, prompt);
      case 'local':
        return this.callLocalLLM(config, emailContent, prompt);
      default:
        throw new Error(`Unsupported LLM provider: ${name}`);
    }
  }

  private async callOpenAI(
    config: any,
    emailContent: string,
    prompt: string,
  ): Promise<Omit<LLMAnalysisResult, 'response_time_ms'>> {
    const response = await axios.post(
      `${config.baseUrl}/chat/completions`,
      {
        model: config.model,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: emailContent },
        ],
        temperature: 0.1,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const content = response.data.choices[0].message.content;
    return this.parseResponse('openai', config.model, content);
  }

  private async callAnthropic(
    config: any,
    emailContent: string,
    prompt: string,
  ): Promise<Omit<LLMAnalysisResult, 'response_time_ms'>> {
    const response = await axios.post(
      `${config.baseUrl}/v1/messages`,
      {
        model: config.model,
        max_tokens: 500,
        temperature: 0.1,
        messages: [{ role: 'user', content: `${prompt}\n\n${emailContent}` }],
      },
      {
        headers: {
          'x-api-key': config.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
      },
    );

    const content = response.data.content[0].text;
    return this.parseResponse('anthropic', config.model, content);
  }

  private async callLocalLLM(
    config: any,
    emailContent: string,
    prompt: string,
  ): Promise<Omit<LLMAnalysisResult, 'response_time_ms'>> {
    // Supporto per Ollama
    if (config.provider === 'ollama') {
      const endpoint = config.endpoint || config.baseUrl || 'http://localhost:11434';
      this.logger.debug(`Calling Ollama at: ${endpoint}/api/generate`);
      this.logger.debug(`Model: ${config.model}`);
      this.logger.debug(`Config: ${JSON.stringify(config)}`);
      
      const response = await axios.post(`${endpoint}/api/generate`, {
        model: config.model,
        prompt: `${prompt}\n\n${emailContent}`,
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 500,
        },
      });

      const content = response.data.response;
      return this.parseResponse('local-ollama', config.model, content);
    }

    // Supporto per altri LLM locali (LM Studio, text-generation-webui, etc.)
    const endpoint = config.endpoint || config.baseUrl || 'http://localhost:8080';
    const response = await axios.post(
      `${endpoint}/v1/chat/completions`,
      {
        model: config.model,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: emailContent },
        ],
        temperature: 0.1,
        max_tokens: 500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const content = response.data.choices[0].message.content;
    return this.parseResponse('local', config.model, content);
  }

  private parseResponse(
    provider: string,
    model: string,
    content: string,
  ): Omit<LLMAnalysisResult, 'response_time_ms'> {
    try {
      // Prova a parsare JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          provider,
          model,
          is_spam: Boolean(parsed.is_spam),
          confidence: Math.min(
            100,
            Math.max(0, Number(parsed.confidence) || 0),
          ),
          reasoning: String(parsed.reasoning || 'No reasoning provided'),
          risk_factors: Array.isArray(parsed.risk_factors)
            ? parsed.risk_factors
            : [],
        };
      }
    } catch (error) {
      this.logger.warn(`Failed to parse LLM JSON response: ${error.message}`);
    }

    // Fallback: analisi testuale semplice
    const lowerContent = content.toLowerCase();
    const isSpam =
      lowerContent.includes('spam') ||
      lowerContent.includes('phishing') ||
      lowerContent.includes('malicious');

    return {
      provider,
      model,
      is_spam: isSpam,
      confidence: isSpam ? 70 : 30,
      reasoning:
        content.substring(0, 200) + (content.length > 200 ? '...' : ''),
      risk_factors: isSpam ? ['Text analysis detected spam indicators'] : [],
    };
  }

  async testConnection(provider: string, config: any): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const testMessage = 'This is a test message to verify the connection.';
      
      switch (provider) {
        case 'openai':
          if (!config.apiKey) {
            return { success: false, message: 'OpenAI API key is required' };
          }
          
          try {
            const response = await axios.post(
              'https://api.openai.com/v1/chat/completions',
              {
                model: config.model || 'gpt-4',
                messages: [{ role: 'user', content: testMessage }],
                max_tokens: 10,
                temperature: 0.1,
              },
              {
                headers: {
                  'Authorization': `Bearer ${config.apiKey}`,
                  'Content-Type': 'application/json',
                },
                timeout: 10000,
              }
            );
            
            return { 
              success: true, 
              message: 'OpenAI connection successful',
              details: { model: response.data.model, usage: response.data.usage }
            };
          } catch (error: any) {
            if (error.response?.status === 401) {
              return { success: false, message: 'Invalid OpenAI API key' };
            } else if (error.response?.status === 429) {
              return { success: false, message: 'OpenAI rate limit exceeded' };
            } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
              return { success: false, message: 'Unable to connect to OpenAI API' };
            }
            return { success: false, message: `OpenAI API error: ${error.message}` };
          }

        case 'anthropic':
          if (!config.apiKey) {
            return { success: false, message: 'Anthropic API key is required' };
          }
          
          try {
            const response = await axios.post(
              'https://api.anthropic.com/v1/messages',
              {
                model: config.model || 'claude-3-sonnet-20240229',
                max_tokens: 10,
                messages: [{ role: 'user', content: testMessage }],
              },
              {
                headers: {
                  'x-api-key': config.apiKey,
                  'Content-Type': 'application/json',
                  'anthropic-version': '2023-06-01',
                },
                timeout: 10000,
              }
            );
            
            return { 
              success: true, 
              message: 'Anthropic connection successful',
              details: { model: response.data.model, usage: response.data.usage }
            };
          } catch (error: any) {
            if (error.response?.status === 401) {
              return { success: false, message: 'Invalid Anthropic API key' };
            } else if (error.response?.status === 429) {
              return { success: false, message: 'Anthropic rate limit exceeded' };
            } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
              return { success: false, message: 'Unable to connect to Anthropic API' };
            }
            return { success: false, message: `Anthropic API error: ${error.message}` };
          }

        case 'local':
          const endpoint = config.endpoint || 'http://localhost:11434';
          const provider_type = config.provider || 'ollama';
          
          if (provider_type === 'ollama') {
            try {
              // Test Ollama connection
              const healthResponse = await axios.get(`${endpoint}/api/tags`, { timeout: 5000 });
              
              if (!healthResponse.data.models || !Array.isArray(healthResponse.data.models)) {
                return { success: false, message: 'Ollama is running but no models are available' };
              }
              
              const availableModels = healthResponse.data.models.map((m: any) => m.name);
              const requestedModel = config.model || 'llama3';
              
              if (!availableModels.some((model: string) => model.includes(requestedModel))) {
                return { 
                  success: false, 
                  message: `Model '${requestedModel}' not found. Available models: ${availableModels.join(', ')}` 
                };
              }
              
              // Test generation
              const testResponse = await axios.post(
                `${endpoint}/api/generate`,
                {
                  model: requestedModel,
                  prompt: testMessage,
                  stream: false,
                  options: { num_predict: 10 },
                },
                { timeout: 15000 }
              );
              
              return { 
                success: true, 
                message: 'Ollama connection successful',
                details: { 
                  model: requestedModel, 
                  available_models: availableModels,
                  endpoint 
                }
              };
            } catch (error: any) {
              if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                return { 
                  success: false, 
                  message: `Unable to connect to Ollama at ${endpoint}. Make sure Ollama is running.` 
                };
              }
              return { success: false, message: `Ollama error: ${error.message}` };
            }
          } else {
            // Test other local providers (LM Studio, etc.)
            try {
              const response = await axios.post(
                `${endpoint}/v1/chat/completions`,
                {
                  model: config.model,
                  messages: [{ role: 'user', content: testMessage }],
                  max_tokens: 10,
                  temperature: 0.1,
                },
                {
                  headers: { 'Content-Type': 'application/json' },
                  timeout: 10000,
                }
              );
              
              return { 
                success: true, 
                message: `Local LLM connection successful`,
                details: { model: config.model, endpoint }
              };
            } catch (error: any) {
              if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                return { 
                  success: false, 
                  message: `Unable to connect to local LLM at ${endpoint}` 
                };
              }
              return { success: false, message: `Local LLM error: ${error.message}` };
            }
          }

        default:
          return { success: false, message: `Unknown provider: ${provider}` };
      }
    } catch (error: any) {
      this.logger.error(`LLM connection test error: ${error.message}`);
      return { success: false, message: `Connection test failed: ${error.message}` };
    }
  }
}
