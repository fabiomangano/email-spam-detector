import { Injectable } from '@nestjs/common';
import { TechnicalAnalysisResult } from '../technical/technical.service';
import { BehaviorAnalysisResult } from '../behavior/behavior.service';
import { NlpAnalysisResult } from '../nlp/nlp.service';

export interface SpamAnalysisResult {
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  summary: string;
  details: {
    technical: TechnicalAnalysisResult;
    behavior: BehaviorAnalysisResult;
    nlp: NlpAnalysisResult;
  };
  recommendations: string[];
}

@Injectable()
export class ResultService {
  async generateResult(
    technicalResult: TechnicalAnalysisResult,
    behaviorResult: BehaviorAnalysisResult,
    nlpResult: NlpAnalysisResult
  ): Promise<SpamAnalysisResult> {
    // Calcola il punteggio complessivo basato sui risultati dei moduli
    const technicalScore = this.calculateTechnicalScore(technicalResult);
    const behaviorScore = this.calculateBehaviorScore(behaviorResult);
    const nlpScore = this.calculateNlpScore(nlpResult);
    
    const overallScore = (technicalScore + behaviorScore + nlpScore) / 3;
    
    return {
      overallScore,
      riskLevel: this.determineRiskLevel(overallScore),
      summary: this.generateSummary(overallScore),
      details: {
        technical: technicalResult,
        behavior: behaviorResult,
        nlp: nlpResult
      },
      recommendations: this.generateRecommendations(overallScore)
    };
  }

  private calculateTechnicalScore(technical: TechnicalAnalysisResult): number {
    let score = 0;
    if (technical.spf.status !== 'pass') score += 0.3;
    if (technical.dkim.status !== 'pass') score += 0.3;
    if (technical.dmarc.status !== 'pass') score += 0.3;
    if (technical.headers.suspicious.length > 0) score += 0.1;
    return Math.min(score, 1);
  }

  private calculateBehaviorScore(behavior: BehaviorAnalysisResult): number {
    return Math.min((behavior.urgency.score + behavior.socialEngineering.score) / 2, 1);
  }

  private calculateNlpScore(nlp: NlpAnalysisResult): number {
    return Math.min(nlp.toxicity.score, 1);
  }

  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (score < 0.3) return 'low';
    if (score < 0.7) return 'medium';
    return 'high';
  }

  private generateSummary(score: number): string {
    if (score < 0.3) return 'Email appears to be legitimate with low spam indicators';
    if (score < 0.7) return 'Email shows some suspicious characteristics, exercise caution';
    return 'Email has high spam/phishing indicators, handle with extreme caution';
  }

  private generateRecommendations(score: number): string[] {
    const recommendations: string[] = [];
    if (score > 0.3) {
      recommendations.push('Verify sender identity through alternative means');
    }
    if (score > 0.5) {
      recommendations.push('Do not click on any links or download attachments');
    }
    if (score > 0.7) {
      recommendations.push('Consider reporting this email as spam/phishing');
    }
    return recommendations;
  }
}
