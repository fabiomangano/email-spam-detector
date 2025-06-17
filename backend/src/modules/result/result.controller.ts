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
      const mockResult = this.resultService.generateResult(
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
          numReceivedHeaders: 3,
          hasOutlookReceivedPattern: false,
          xMailerBrand: 'Outlook',
          missingDateHeader: false,
          fromNameSuspicious: false,
          fromDomainIsDisposable: false,
          sentToMultiple: false,
          campaignIdentifierPresent: false,
          containsFeedbackLoopHeader: false,
          uppercaseRatio: 0.05,
          excessiveExclamations: false,
          containsUrgencyWords: false,
          containsElectionTerms: false,
          containsObfuscatedText: false,
          numExternalDomains: 1,
          linkDisplayMismatch: false,
          containsShortenedUrls: false,
          usesEncodedUrls: false,
          linkToImageRatio: 2.0,
          hasMixedContentTypes: false,
          hasNestedMultipart: false,
          boundaryAnomaly: false,
          hasFakeMultipartAlternative: false,
          isImageHeavy: false,
          hasRepeatedLinks: false,
        },
        {
          tokens: ['test', 'email', 'content'],
          tfidfVector: [0.1, 0.2, 0.1],
          nlpMetrics: {
            numSpammyWords: 0,
            spamWordRatio: 0,
            allCapsCount: 0,
            exclamationCount: 0,
            tokens: ['test', 'email', 'content'],
          },
          prediction: 'ham',
          sentiment: { score: 0, label: 'neutral' },
          keywords: ['test', 'email', 'content'],
          topics: ['legitimate'],
          language: { detected: 'en', confidence: 0.9 },
          toxicity: { score: 0.1, categories: [] },
        },
      );
      return res.json(mockResult);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }
}
