import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { LLMService } from './llm.service';
import { ParsingService } from '../parsing/parsing.service';
import { ConfigService } from '../config/config.service';

@Controller('llm')
export class LLMController {
  constructor(
    private readonly llmService: LLMService,
    private readonly parsingService: ParsingService,
    private readonly configService: ConfigService,
  ) {}

  @Post('analyze')
  async analyzeEmailContent(@Body() body: { content: string }) {
    console.log('LLM Controller: analyzeEmailContent called');
    try {
      // Parse l'email dal contenuto grezzo
      const parseResult = await this.parsingService.parseEmailContent(
        body.content,
      );
      const parsedEmail = parseResult.parsed;

      if (!parsedEmail.parsingOk) {
        return {
          success: false,
          error: 'Failed to parse email content',
          warnings: parsedEmail.warnings,
        };
      }

      // Analizza con LLM
      const llmResult = await this.llmService.analyzeEmail(parsedEmail);

      if (!llmResult) {
        return {
          success: false,
          error: 'LLM analysis failed - no result returned',
        };
      }

      // Transform LLM result to frontend format
      const analysisResult = {
        spamProbability: llmResult.is_spam ? llmResult.confidence / 100 : (1 - llmResult.confidence / 100),
        confidence: llmResult.confidence / 100,
        reasoning: llmResult.reasoning,
        keyIndicators: llmResult.risk_factors || [],
      };

      console.log('LLM Controller: Original result:', JSON.stringify(llmResult));
      console.log('LLM Controller: Transformed result:', JSON.stringify(analysisResult));

      return {
        success: true,
        parsing: {
          subject: parsedEmail.metadata?.subject,
          from: parsedEmail.metadata?.from,
          contentLength: (parsedEmail.plainText || parsedEmail.htmlText || '')
            .length,
        },
        analysis: analysisResult,
        provider: llmResult.provider,
        model: llmResult.model,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
      };
    }
  }

  @Get('analyze/:filename')
  async analyzeEmailFile(@Param('filename') filename: string) {
    try {
      // Parse l'email dal file
      const parseResult = await this.parsingService.parseEmailFile(filename);
      const parsedEmail = parseResult.parsed;

      if (!parsedEmail.parsingOk) {
        return {
          success: false,
          error: 'Failed to parse email file',
          warnings: parsedEmail.warnings,
        };
      }

      // Analizza con LLM
      const llmResult = await this.llmService.analyzeEmail(parsedEmail);

      if (!llmResult) {
        return {
          success: false,
          error: 'LLM analysis failed - no result returned',
        };
      }

      // Transform LLM result to frontend format
      const analysisResult = {
        spamProbability: llmResult.is_spam ? llmResult.confidence / 100 : (1 - llmResult.confidence / 100),
        confidence: llmResult.confidence / 100,
        reasoning: llmResult.reasoning,
        keyIndicators: llmResult.risk_factors || [],
      };

      return {
        success: true,
        filename,
        parsing: {
          subject: parsedEmail.metadata?.subject,
          from: parsedEmail.metadata?.from,
          contentLength: (parsedEmail.plainText || parsedEmail.htmlText || '')
            .length,
        },
        analysis: analysisResult,
        provider: llmResult.provider,
        model: llmResult.model,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
      };
    }
  }

  @Get('config')
  async getLLMConfig() {
    try {
      const config = this.configService.getConfig();
      const llmConfig = config.llm || {};
      
      // Return configuration without API keys for security
      return {
        providers: {
          openai: {
            enabled: llmConfig.providers?.openai?.enabled || false,
            model: llmConfig.providers?.openai?.model || 'gpt-4',
            temperature: llmConfig.providers?.openai?.temperature || 0.7,
          },
          anthropic: {
            enabled: llmConfig.providers?.anthropic?.enabled || false,
            model: llmConfig.providers?.anthropic?.model || 'claude-3-sonnet-20240229',
            temperature: llmConfig.providers?.anthropic?.temperature || 0.7,
          },
          local: {
            enabled: llmConfig.providers?.local?.enabled || false,
            model: llmConfig.providers?.local?.model || 'llama3',
            provider: llmConfig.providers?.local?.provider || 'ollama',
            endpoint: llmConfig.providers?.local?.endpoint || 'http://localhost:11434',
          },
        },
        activeProvider: llmConfig.activeProvider || 'openai',
        systemPrompt: llmConfig.prompts?.spam_analysis || '',
      };
    } catch (error) {
      console.error('Error getting LLM config:', error);
      return {
        providers: {
          openai: { enabled: false, model: 'gpt-4', temperature: 0.7 },
          anthropic: { enabled: false, model: 'claude-3-sonnet-20240229', temperature: 0.7 },
          local: { enabled: false, model: 'llama3', provider: 'ollama', endpoint: 'http://localhost:11434' },
        },
        activeProvider: 'openai',
        systemPrompt: '',
      };
    }
  }

  @Post('config')
  async saveLLMConfig(@Body() body: any) {
    try {
      const currentConfig = this.configService.getConfig();
      
      // Update LLM configuration
      const updatedConfig = {
        ...currentConfig,
        llm: {
          providers: {
            openai: {
              enabled: body.providers?.openai?.enabled || false,
              model: body.providers?.openai?.model || 'gpt-4',
              apiKey: body.providers?.openai?.apiKey || currentConfig.llm?.providers?.openai?.apiKey || '',
              temperature: body.providers?.openai?.temperature || 0.7,
            },
            anthropic: {
              enabled: body.providers?.anthropic?.enabled || false,
              model: body.providers?.anthropic?.model || 'claude-3-sonnet-20240229',
              apiKey: body.providers?.anthropic?.apiKey || currentConfig.llm?.providers?.anthropic?.apiKey || '',
              temperature: body.providers?.anthropic?.temperature || 0.7,
            },
            local: {
              enabled: body.providers?.local?.enabled || false,
              model: body.providers?.local?.model || 'llama3',
              provider: body.providers?.local?.provider || 'ollama',
              endpoint: body.providers?.local?.endpoint || 'http://localhost:11434',
            },
          },
          activeProvider: body.activeProvider || 'openai',
          prompts: {
            spam_analysis: body.systemPrompt || currentConfig.llm?.prompts?.spam_analysis || '',
          },
        },
      };

      // Save the updated configuration
      this.configService.updateConfig(updatedConfig);

      return { success: true, message: 'LLM configuration saved successfully' };
    } catch (error) {
      console.error('Error saving LLM config:', error);
      return { success: false, error: 'Failed to save LLM configuration' };
    }
  }

  @Post('config/reset')
  async resetLLMConfig() {
    try {
      const defaultConfig = this.configService.getDefaultConfig();
      const currentConfig = this.configService.getConfig();
      
      // Reset LLM configuration to defaults
      const updatedConfig = {
        ...currentConfig,
        llm: defaultConfig.llm || {
          providers: {
            openai: { enabled: false, model: 'gpt-4', apiKey: '', temperature: 0.7 },
            anthropic: { enabled: false, model: 'claude-3-sonnet-20240229', apiKey: '', temperature: 0.7 },
            local: { enabled: false, model: 'llama3', provider: 'ollama', endpoint: 'http://localhost:11434' },
          },
          activeProvider: 'openai',
          prompts: {
            spam_analysis: (defaultConfig.llm as any)?.prompts?.spam_analysis || '',
          },
        },
      };

      this.configService.updateConfig(updatedConfig);

      return { success: true, message: 'LLM configuration reset to defaults' };
    } catch (error) {
      console.error('Error resetting LLM config:', error);
      return { success: false, error: 'Failed to reset LLM configuration' };
    }
  }

  @Post('test')
  async testLLMConnection(@Body() body: { provider: string; config: any }) {
    try {
      // Test the LLM connection with the provided configuration
      const testResult = await this.llmService.testConnection(body.provider, body.config);
      
      return {
        success: testResult.success,
        message: testResult.message || 'Connection test completed',
        details: testResult.details,
      };
    } catch (error) {
      console.error('Error testing LLM connection:', error);
      return {
        success: false,
        error: 'Failed to test LLM connection',
        message: error.message || 'Unknown error occurred',
      };
    }
  }
}
