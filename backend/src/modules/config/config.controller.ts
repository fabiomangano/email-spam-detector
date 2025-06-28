import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ConfigService, SpamDetectionConfig } from './config.service';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  getConfig(): SpamDetectionConfig {
    try {
      return this.configService.getConfig();
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve configuration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  saveConfig(@Body() config: SpamDetectionConfig): { message: string } {
    try {
      // Basic validation
      if (!config || typeof config !== 'object') {
        throw new HttpException(
          'Invalid configuration format',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate required sections
      const requiredSections = [
        'scoring',
        'technical',
        'nlp',
        'domains',
        'keywords',
      ];
      for (const section of requiredSections) {
        if (!config[section]) {
          throw new HttpException(
            `Missing required configuration section: ${section}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Validate scoring weights sum to 1
      const weights = config.scoring.weights;
      if (Math.abs(weights.technical + weights.nlp - 1.0) > 0.001) {
        throw new HttpException(
          'Technical and NLP weights must sum to 1.0',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate risk levels
      const riskLevels = config.scoring.riskLevels;
      if (riskLevels.low >= riskLevels.medium) {
        throw new HttpException(
          'Low risk threshold must be less than medium risk threshold',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.configService.saveConfig(config);
      return { message: 'Configuration saved successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to save configuration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('reset')
  resetConfig(): { message: string } {
    try {
      this.configService.resetToDefault();
      return { message: 'Configuration reset to default values' };
    } catch (error) {
      throw new HttpException(
        'Failed to reset configuration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('import')
  @UseInterceptors(AnyFilesInterceptor())
  importData(@UploadedFiles() files: Express.Multer.File[]): {
    message: string;
    domains_imported: number;
    words_imported: number;
  } {
    try {
      let domainsImported = 0;
      let wordsImported = 0;

      if (!files || files.length === 0) {
        throw new HttpException('No files uploaded', HttpStatus.BAD_REQUEST);
      }

      const currentConfig = this.configService.getConfig();

      for (const file of files) {
        const content = file.buffer.toString('utf8');
        const lines = content
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0 && !line.startsWith('#'));

        if (file.fieldname === 'domains_file') {
          // Validate domain format
          const validDomains = lines.filter((line) => {
            const domainRegex =
              /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}$/;
            return domainRegex.test(line);
          });

          // Add to suspicious domains, avoiding duplicates
          const existingSuspicious = new Set(currentConfig.domains.suspicious);
          validDomains.forEach((domain) => {
            if (!existingSuspicious.has(domain)) {
              currentConfig.domains.suspicious.push(domain);
              domainsImported++;
            }
          });
        } else if (file.fieldname === 'spam_words_file') {
          // Add to spam keywords, avoiding duplicates
          const existingSpam = new Set(currentConfig.keywords.spam);
          lines.forEach((word) => {
            if (!existingSpam.has(word.toLowerCase())) {
              currentConfig.keywords.spam.push(word.toLowerCase());
              wordsImported++;
            }
          });
        }
      }

      // Save updated configuration
      this.configService.saveConfig(currentConfig);

      return {
        message: 'Data imported successfully',
        domains_imported: domainsImported,
        words_imported: wordsImported,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to import data: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
