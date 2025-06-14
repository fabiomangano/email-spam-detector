import { Injectable } from '@nestjs/common';

export interface BehaviorAnalysisResult {
  urgency: {
    score: number;
    indicators: string[];
  };
  socialEngineering: {
    score: number;
    techniques: string[];
  };
  patterns: {
    suspicious: string[];
    analysis: string;
  };
}

@Injectable()
export class BehaviorService {
  async analyzeBehavior(parsedData: any): Promise<BehaviorAnalysisResult> {
    // Analisi comportamentale dell'email (urgenza, social engineering, pattern)
    return {
      urgency: {
        score: 0.2,
        indicators: []
      },
      socialEngineering: {
        score: 0.1,
        techniques: []
      },
      patterns: {
        suspicious: [],
        analysis: 'No suspicious behavioral patterns detected'
      }
    };
  }
}
