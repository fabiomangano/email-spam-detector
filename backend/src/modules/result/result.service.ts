import { Injectable } from '@nestjs/common';
import { generateResult, SpamAnalysisResult } from '../../utils/result.util';
import { EmailTechnicalMetrics } from '../../utils/email-metrics';
import { BehaviorAnalysisResult } from '../../utils/behavior.util';
import { NlpAnalysisResult } from '../../utils/nlp.util';

@Injectable()
export class ResultService {
  generateResult(
    technicalResult: EmailTechnicalMetrics,
    behaviorResult: BehaviorAnalysisResult,
    nlpResult: NlpAnalysisResult,
  ): Promise<SpamAnalysisResult> {
    return generateResult(technicalResult, behaviorResult, nlpResult);
  }
}
