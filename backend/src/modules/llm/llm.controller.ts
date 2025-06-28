import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { LLMService } from './llm.service';
import { ParsingService } from '../parsing/parsing.service';

@Controller('llm')
export class LLMController {
  constructor(
    private readonly llmService: LLMService,
    private readonly parsingService: ParsingService,
  ) {}

  @Post('analyze')
  async analyzeEmailContent(@Body() body: { content: string }) {
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

      return {
        success: true,
        parsing: {
          subject: parsedEmail.metadata?.subject,
          from: parsedEmail.metadata?.from,
          contentLength: (parsedEmail.plainText || parsedEmail.htmlText || '')
            .length,
        },
        llmAnalysis: llmResult,
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

      return {
        success: true,
        filename,
        parsing: {
          subject: parsedEmail.metadata?.subject,
          from: parsedEmail.metadata?.from,
          contentLength: (parsedEmail.plainText || parsedEmail.htmlText || '')
            .length,
        },
        llmAnalysis: llmResult,
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
    // Restituisce la configurazione LLM (senza API keys per sicurezza)
    return {
      providers: {
        openai: { enabled: false, model: 'gpt-4' },
        anthropic: { enabled: false, model: 'claude-3-sonnet-20240229' },
        local: { enabled: true, model: 'llama3', provider: 'ollama' },
      },
    };
  }
}
