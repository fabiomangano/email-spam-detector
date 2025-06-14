import { Controller, Get, Res } from '@nestjs/common';
import { ResultService } from './result.service';
import { Response } from 'express';

@Controller('result')
export class ResultController {
  constructor(private readonly resultService: ResultService) {}

  @Get('test')
  async testResult(@Res() res: Response) {
    try {
      // Endpoint per testare il servizio result
      const mockResult = await this.resultService.generateResult(
        {
          bodyLength: 1000,
          numLinks: 2,
          linkRatio: 0.002,
          numImages: 1,
          hasTrackingPixel: false,
          hasAttachments: false,
          numAttachments: 0,
          attachmentTypes: [],
          spfResult: 'pass',
          dkimResult: 'pass',
          dmarcResult: 'pass',
          ipSender: '192.168.1.1',
          isHtmlOnly: false,
          numDomains: 2,
          replyToDiffersFromFrom: false,
        },
        {
          urgency: { score: 0.1, indicators: [] },
          socialEngineering: { score: 0.1, techniques: [] },
          patterns: { suspicious: [], analysis: 'test' },
        },
        {
          sentiment: { score: 0, label: 'neutral' },
          keywords: [],
          topics: [],
          language: { detected: 'it', confidence: 0.9 },
          toxicity: { score: 0.1, categories: [] },
        },
      );
      return res.json(mockResult);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }
}
