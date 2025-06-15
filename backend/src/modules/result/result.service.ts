import { Injectable } from '@nestjs/common';
import { generateResult, SpamAnalysisResult } from '../../utils/result.util';
import { EmailTechnicalMetrics } from '../../utils/email-metrics';
import { NlpAnalysisResult } from '../../utils/nlp.util';

@Injectable()
export class ResultService {
  generateResult(
    technicalResult: EmailTechnicalMetrics,
    nlpResult: NlpAnalysisResult,
  ): Promise<SpamAnalysisResult> {
    return generateResult(technicalResult, nlpResult);
  }
}
