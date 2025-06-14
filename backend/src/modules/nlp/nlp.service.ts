import { Injectable } from '@nestjs/common';

export interface NlpAnalysisResult {
  sentiment: {
    score: number;
    label: string;
  };
  keywords: string[];
  topics: string[];
  language: {
    detected: string;
    confidence: number;
  };
  toxicity: {
    score: number;
    categories: string[];
  };
}

@Injectable()
export class NlpService {
  async analyzeNlp(parsedData: any): Promise<NlpAnalysisResult> {
    // Analisi NLP del contenuto dell'email
    return {
      sentiment: {
        score: 0.0,
        label: 'neutral'
      },
      keywords: ['email', 'content'],
      topics: ['general'],
      language: {
        detected: 'it',
        confidence: 0.95
      },
      toxicity: {
        score: 0.1,
        categories: []
      }
    };
  }
}
