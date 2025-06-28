import { Injectable } from '@nestjs/common';
import { SpamAnalysisResult } from '../utils/types';
import { ParsingService } from '../modules/parsing/parsing.service';
import { TechnicalService } from '../modules/technical/technical.service';
import { NlpService } from '../modules/nlp/nlp.service';
import { ResultService } from '../modules/result/result.service';
import { BehavioralService } from '../modules/behavioral/behavioral.service';

@Injectable()
export class PipelineService {
  constructor(
    private readonly parsingService: ParsingService,
    private readonly technicalService: TechnicalService,
    private readonly nlpService: NlpService,
    private readonly resultService: ResultService,
    private readonly behavioralService: BehavioralService,
  ) {}

  private getRecipientsCount(parsed: any): number {
    let count = 0;
    
    // Count recipients from metadata.to (which is a string like "user@example.com, user2@example.com")
    if (parsed.metadata?.to) {
      const toEmails = parsed.metadata.to.split(',').map((email: string) => email.trim()).filter((email: string) => email.length > 0);
      count += toEmails.length;
    }
    
    // Check headers for cc and bcc if available
    if (parsed.headers?.cc) {
      if (typeof parsed.headers.cc === 'string') {
        const ccEmails = parsed.headers.cc.split(',').map((email: string) => email.trim()).filter((email: string) => email.length > 0);
        count += ccEmails.length;
      }
    }
    
    if (parsed.headers?.bcc) {
      if (typeof parsed.headers.bcc === 'string') {
        const bccEmails = parsed.headers.bcc.split(',').map((email: string) => email.trim()).filter((email: string) => email.length > 0);
        count += bccEmails.length;
      }
    }
    
    return Math.max(1, count); // At least 1 recipient
  }

  async runFullPipeline(filename: string): Promise<SpamAnalysisResult> {
    // Step 1: Parsing
    const parsedData = await this.parsingService.parseEmailFile(filename);

    // Step 2: Technical Analysis
    const technicalResult = this.technicalService.analyzeTechnical(
      parsedData.parsed,
    );

    console.log(technicalResult, 'techincal result');

    // Step 3: NLP Analysis
    const nlpResult = await this.nlpService.analyzeNlp(parsedData.parsed);

    // Step 4: Behavioral Analysis
    const behavioralResult = this.behavioralService.analyzeBehavior(
      parsedData.parsed.metadata.from || 'unknown',
      parsedData.parsed.metadata.date || new Date().toISOString(),
      parsedData.parsed.metadata.subject || '',
      this.getRecipientsCount(parsedData.parsed),
      parsedData.parsed.plainText || parsedData.parsed.htmlText || ''
    );

    console.log(behavioralResult, 'behavioral result');

    // Step 5: Generate Final Result
    const finalResult = await this.resultService.generateResult(
      technicalResult,
      nlpResult,
      behavioralResult,
    );

    return {
      ...finalResult,
      details: {
        technical: finalResult.details.technical,
        nlp: finalResult.details.nlp,
        behavioral: behavioralResult,
        parsing: {
          parsed: parsedData.parsed,
          metrics: {
            spfResult: technicalResult.spfResult,
            dkimResult: technicalResult.dkimResult,
            dmarcResult: technicalResult.dmarcResult,
          },
        },
      },
    } as SpamAnalysisResult;
  }
}
