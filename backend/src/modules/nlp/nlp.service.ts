import { Injectable } from '@nestjs/common';
import { analyzeNlp, NlpAnalysisResult } from '../../utils/nlp.util';

@Injectable()
export class NlpService {
  analyzeNlp(parsedData: any): Promise<NlpAnalysisResult> {
    return analyzeNlp(parsedData);
  }
}
