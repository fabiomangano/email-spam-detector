import { Injectable } from '@nestjs/common';
import { EmailTechnicalMetrics, NlpAnalysisResult, SpamAnalysisResult, DecisionMetrics } from '../../utils/types';

@Injectable()
export class ResultService {
  async generateResult(
    technicalResult: EmailTechnicalMetrics,
    nlpResult: NlpAnalysisResult,
  ): Promise<SpamAnalysisResult> {
    // Usa il nuovo sistema di calcolo
    const decisionMetrics = this.calculateResult(technicalResult, nlpResult);
    
    // Il punteggio finale è basato solo su technical e NLP
    const overallScore = Math.min(decisionMetrics.finalScore / 10, 1);

    return {
      overallScore,
      riskLevel: this.determineRiskLevel(overallScore),
      summary: this.generateSummary(overallScore),
      details: {
        technical: technicalResult,
        nlp: nlpResult,
      },
      recommendations: this.generateRecommendations(overallScore),
    };
  }

  private calculateTechnicalScore(metrics: EmailTechnicalMetrics): number {
    let score = 0;

    // Penalizzazioni per caratteristiche tecniche
    if (metrics.linkRatio > 0.01) score += 2;
    if (metrics.numLinks > 5) score += 3;
    if (metrics.numDomains > 3) score += 2;
    if (metrics.hasTrackingPixel) score += 2;
    if (metrics.replyToDiffersFromFrom) score += 1;
    if (metrics.isHtmlOnly) score += 1;
    if (metrics.hasAttachments) score += 2;

    // Considera SPF, DKIM e DMARC
    if (metrics.spfResult === 'fail') score += 3;
    if (metrics.dkimResult === 'fail') score += 3;
    if (metrics.dmarcResult === 'fail') score += 3;

    return score;
  }

  private calculateNlpScore(nlpMetrics: any): number {
    let score = 0;

    // Penalizzazioni per parole spam
    if (nlpMetrics?.spamWordRatio > 0.05) score += 3;
    if (nlpMetrics?.numSpammyWords > 3) score += 2;

    // Penalizzazioni per uso di maiuscole o esclamazioni
    if (nlpMetrics?.allCapsCount > 5) score += 2;
    if (nlpMetrics?.exclamationCount > 3) score += 2;

    return score;
  }

  private calculateResult(
    technicalMetrics: EmailTechnicalMetrics,
    nlpOutput: any,
  ): DecisionMetrics {
    console.log('### STEP 5 - Decision Layer Started ###');

    // Calcola i punteggi
    const techScore = this.calculateTechnicalScore(technicalMetrics);
    const nlpScore = this.calculateNlpScore(nlpOutput?.nlpMetrics || {});

    // Ponderazione: 60% tecniche, 40% NLP
    const finalScore = techScore * 0.6 + nlpScore * 0.4;

    // Soglia di decisione
    const isSpam = finalScore > 5 || nlpOutput?.prediction === 'spam';

    const finalPrediction = isSpam ? 'spam' : 'ham';

    console.log('📦 Technical Score:', techScore);
    console.log('🧠 NLP Score:', nlpScore);
    console.log('📊 Final Score:', finalScore);
    console.log('📌 Final Prediction:', finalPrediction);

    console.log('### STEP 5 - Decision Layer Ended ###');

    return {
      techScore,
      nlpScore,
      finalScore,
      finalPrediction,
    };
  }

  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (score < 0.3) return 'low';
    if (score < 0.7) return 'medium';
    return 'high';
  }

  private generateSummary(score: number): string {
    if (score < 0.3)
      return 'Email appears to be legitimate with low spam indicators';
    if (score < 0.7)
      return 'Email shows some suspicious characteristics, exercise caution';
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
