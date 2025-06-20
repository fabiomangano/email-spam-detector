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

  async analyzeEmail(parsedEmail: ParsedEmail): Promise<LLMAnalysisResult | null> {
    const config = this.configService.getConfig();
    
    if (!config.llm?.enabled) {
      this.logger.debug('LLM analysis disabled in configuration');
      return null;
    }

    // Trova il primo provider abilitato
    const enabledProvider = this.getEnabledProvider(config.llm.providers);
    if (!enabledProvider) {
      this.logger.warn('No LLM provider enabled');
      return null;
    }

    const startTime = Date.now();
    
    try {
      const emailContent = this.prepareEmailContent(parsedEmail);
      const result = await this.callLLMProvider(enabledProvider, emailContent, config.llm.prompts.spam_analysis);
      
      const responseTime = Date.now() - startTime;
      
      return {
        ...result,
        response_time_ms: responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error(`LLM analysis failed: ${error.message}`);
      
      return {
        provider: enabledProvider.name,
        model: enabledProvider.config.model,
        is_spam: false,
        confidence: 0,
        reasoning: 'LLM analysis failed',
        risk_factors: [],
        response_time_ms: responseTime,
        error: error.message
      };
    }
  }

  private getEnabledProvider(providers: any): { name: string; config: any } | null {
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
    const truncatedContent = content.length > maxLength 
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

  private async callLLMProvider(provider: { name: string; config: any }, emailContent: string, prompt: string): Promise<Omit<LLMAnalysisResult, 'response_time_ms'>> {
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

  private async callOpenAI(config: any, emailContent: string, prompt: string): Promise<Omit<LLMAnalysisResult, 'response_time_ms'>> {
    const response = await axios.post(`${config.baseUrl}/chat/completions`, {
      model: config.model,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: emailContent }
      ],
      temperature: 0.1,
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const content = response.data.choices[0].message.content;
    return this.parseResponse('openai', config.model, content);
  }

  private async callAnthropic(config: any, emailContent: string, prompt: string): Promise<Omit<LLMAnalysisResult, 'response_time_ms'>> {
    const response = await axios.post(`${config.baseUrl}/v1/messages`, {
      model: config.model,
      max_tokens: 500,
      temperature: 0.1,
      messages: [
        { role: 'user', content: `${prompt}\n\n${emailContent}` }
      ]
    }, {
      headers: {
        'x-api-key': config.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      }
    });

    const content = response.data.content[0].text;
    return this.parseResponse('anthropic', config.model, content);
  }

  private async callLocalLLM(config: any, emailContent: string, prompt: string): Promise<Omit<LLMAnalysisResult, 'response_time_ms'>> {
    // Supporto per Ollama
    if (config.provider === 'ollama') {
      const response = await axios.post(`${config.baseUrl}/api/generate`, {
        model: config.model,
        prompt: `${prompt}\n\n${emailContent}`,
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 500
        }
      });

      const content = response.data.response;
      return this.parseResponse('local-ollama', config.model, content);
    }
    
    // Supporto per altri LLM locali (LM Studio, text-generation-webui, etc.)
    const response = await axios.post(`${config.baseUrl}/v1/chat/completions`, {
      model: config.model,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: emailContent }
      ],
      temperature: 0.1,
      max_tokens: 500
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const content = response.data.choices[0].message.content;
    return this.parseResponse('local', config.model, content);
  }

  private parseResponse(provider: string, model: string, content: string): Omit<LLMAnalysisResult, 'response_time_ms'> {
    try {
      // Prova a parsare JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          provider,
          model,
          is_spam: Boolean(parsed.is_spam),
          confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 0)),
          reasoning: String(parsed.reasoning || 'No reasoning provided'),
          risk_factors: Array.isArray(parsed.risk_factors) ? parsed.risk_factors : []
        };
      }
    } catch (error) {
      this.logger.warn(`Failed to parse LLM JSON response: ${error.message}`);
    }

    // Fallback: analisi testuale semplice
    const lowerContent = content.toLowerCase();
    const isSpam = lowerContent.includes('spam') || lowerContent.includes('phishing') || lowerContent.includes('malicious');
    
    return {
      provider,
      model,
      is_spam: isSpam,
      confidence: isSpam ? 70 : 30,
      reasoning: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
      risk_factors: []
    };
  }
}