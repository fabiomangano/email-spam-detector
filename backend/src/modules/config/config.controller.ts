import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
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
        HttpStatus.INTERNAL_SERVER_ERROR
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
          HttpStatus.BAD_REQUEST
        );
      }

      // Validate required sections
      const requiredSections = ['scoring', 'technical', 'nlp', 'domains', 'keywords'];
      for (const section of requiredSections) {
        if (!config[section]) {
          throw new HttpException(
            `Missing required configuration section: ${section}`,
            HttpStatus.BAD_REQUEST
          );
        }
      }

      // Validate scoring weights sum to 1
      const weights = config.scoring.weights;
      if (Math.abs(weights.technical + weights.nlp - 1.0) > 0.001) {
        throw new HttpException(
          'Technical and NLP weights must sum to 1.0',
          HttpStatus.BAD_REQUEST
        );
      }

      // Validate risk levels
      const riskLevels = config.scoring.riskLevels;
      if (riskLevels.low >= riskLevels.medium) {
        throw new HttpException(
          'Low risk threshold must be less than medium risk threshold',
          HttpStatus.BAD_REQUEST
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
        HttpStatus.INTERNAL_SERVER_ERROR
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
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}