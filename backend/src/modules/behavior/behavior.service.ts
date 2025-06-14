import { Injectable } from '@nestjs/common';
import { analyzeBehavior, BehaviorAnalysisResult } from '../../utils/behavior.util';

@Injectable()
export class BehaviorService {
  analyzeBehavior(parsedData: any): Promise<BehaviorAnalysisResult> {
    return analyzeBehavior(parsedData);
  }
}
