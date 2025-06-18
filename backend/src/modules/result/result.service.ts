import { Injectable } from '@nestjs/common';
import {
  EmailTechnicalMetrics,
  NlpAnalysisResult,
  SpamAnalysisResult,
  DecisionMetrics,
} from '../../utils/types';

@Injectable()
export class ResultService {
  generateResult(
    technicalResult: EmailTechnicalMetrics,
    nlpResult: NlpAnalysisResult,
  ): SpamAnalysisResult {
    // Usa il nuovo sistema di calcolo
    const decisionMetrics = this.calculateResult(technicalResult, nlpResult);

    // Il punteggio finale è basato solo su technical e NLP
    // Normalizzazione per il nuovo range di punteggi (soglia più bassa)
    const overallScore = Math.min(decisionMetrics.finalScore / 25, 1);

    return {
      overallScore,
      riskLevel: this.determineRiskLevel(overallScore),
      summary: this.generateSummary(overallScore),
      details: {
        technical: technicalResult,
        nlp: nlpResult,
      },
      recommendations: this.generateRecommendations(overallScore),
      scores: {
        technicalScore: decisionMetrics.techScore,
        nlpScore: decisionMetrics.nlpScore,
        technicalPercentage: Math.min((decisionMetrics.techScore / 25) * 100, 100),
        nlpPercentage: Math.min((decisionMetrics.nlpScore / 25) * 100, 100),
      },
    };
  }

  private calculateTechnicalScore(metrics: EmailTechnicalMetrics): number {
    let score = 0;

    // === METRICHE BASE ===
    if (metrics.linkRatio > 0.01) score += 2;
    if (metrics.numLinks > 5) score += 3;
    if (metrics.numLinks > 3) score += 2; // Multiple links are suspicious
    if (metrics.numDomains > 3) score += 2;
    if (metrics.hasTrackingPixel) score += 3; // Forte indicatore spam
    if (metrics.replyToDiffersFromFrom) score += 6; // Strong spam indicator
    if (metrics.isHtmlOnly) score += 3; // HTML-only emails are suspicious
    if (metrics.hasAttachments) score += 1;

    // === AUTENTICAZIONE EMAIL ===
    if (metrics.spfResult === 'fail') score += 4;
    if (metrics.dkimResult === 'fail') score += 4;
    if (metrics.dmarcResult === 'fail') score += 4;

    // === METRICHE HEADER ===
    if (metrics.numReceivedHeaders > 8) score += 2; // Troppi hop sospetti
    if (metrics.numReceivedHeaders < 2) score += 3; // Too few hops, possibile falsificazione
    if (!metrics.hasOutlookReceivedPattern && metrics.numReceivedHeaders > 0) score += 1;
    if (metrics.missingDateHeader) score += 3; // Header malformato

    // === METRICHE MITTENTE ===
    if (metrics.fromNameSuspicious) score += 2; // Nome tutto maiuscolo
    if (metrics.fromDomainIsDisposable) score += 4; // Email temporanea
    if (metrics.sentToMultiple) score += 2; // Email di massa

    // === METRICHE CAMPAGNA ===
    if (metrics.campaignIdentifierPresent) score += 1; // Newsletter/mailing
    if (
      !metrics.containsFeedbackLoopHeader &&
      metrics.campaignIdentifierPresent
    )
      score += 2; // Campagna senza FBL

    // === METRICHE TESTUALI ===
    if (metrics.uppercaseRatio > 0.3) score += 3; // Troppo maiuscolo
    if (metrics.uppercaseRatio > 0.5) score += 2; // Ancora peggio
    if (metrics.excessiveExclamations) score += 2;
    if (metrics.containsUrgencyWords) score += 4; // Linguaggio pressante
    if (metrics.containsFinancialPromises) score += 5; // Financial promises are strong spam indicators
    if (metrics.sentToMultiple) score += 3; // Email sent to multiple recipients
    if (metrics.containsElectionTerms) score += 2; // Possibile campagna tematica

    // === METRICHE OFFUSCAMENTO E LINK ===
    if (metrics.containsObfuscatedText) score += 4; // Forte indicatore evasione
    if (metrics.numExternalDomains > 5) score += 3; // Troppi domini esterni
    if (metrics.linkDisplayMismatch) score += 4; // Link ingannevole
    if (metrics.containsShortenedUrls) score += 3; // URL mascherati
    if (metrics.usesEncodedUrls) score += 2; // Encoding sospetto
    if (metrics.linkToImageRatio > 10) score += 2; // Troppi link vs contenuto
    if (metrics.hasNonStandardPorts) score += 3; // Link con porte non standard
    if (metrics.containsSuspiciousDomains) score += 4; // Suspicious domains in content
    if (metrics.mailingListSpam) score += 6; // Spam disguised as mailing list

    // === METRICHE MIME ===
    if (metrics.hasMixedContentTypes) score += 1;
    if (metrics.hasNestedMultipart) score += 2; // Struttura complessa
    if (metrics.boundaryAnomaly) score += 2; // Boundary sospetto
    if (metrics.hasFakeMultipartAlternative) score += 3; // MIME fraudolento

    // === NUOVE METRICHE SPAM ===
    if (metrics.isImageHeavy) score += 4; // Email solo immagini con poco testo
    if (metrics.hasRepeatedLinks) score += 3; // Tutti i link vanno allo stesso sito

    return score;
  }

  private calculateNlpScore(nlpMetrics: any): number {
    let score = 0;

    // Penalizzazioni per parole spam
    if (nlpMetrics?.spamWordRatio && nlpMetrics.spamWordRatio > 0.05) score += 3;
    if (nlpMetrics?.numSpammyWords && nlpMetrics.numSpammyWords > 3) score += 2;

    // Penalizzazioni per uso di maiuscole o esclamazioni
    if (nlpMetrics?.allCapsCount && nlpMetrics.allCapsCount > 5) score += 2;
    if (nlpMetrics?.exclamationCount && nlpMetrics.exclamationCount > 3) score += 2;

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

    // Se NLP predice spam ma il punteggio tecnico è basso, aumenta il peso NLP
    let finalScore: number;
    if (nlpOutput?.prediction === 'spam' && techScore < 5) {
      // Quando mancano metriche tecniche ma NLP è sicuro, peso 30% tecnico / 70% NLP
      finalScore = techScore * 0.3 + nlpScore * 0.7 + 3; // Bonus per compensare carenza tecnica
    } else {
      // Ponderazione normale: 60% tecniche, 40% NLP
      finalScore = techScore * 0.6 + nlpScore * 0.4;
    }

    // Soglia di decisione (ridotta per essere più sensibile)
    const isSpam = finalScore > 10 || (nlpOutput && nlpOutput.prediction === 'spam');

    const finalPrediction = isSpam ? 'spam' : 'ham';

    console.log('📦 Technical Score:', techScore);
    console.log('🧠 NLP Score:', nlpScore);
    console.log('📊 Final Score:', finalScore);
    console.log('📌 Final Prediction:', finalPrediction);
    console.log('📈 Overall Score (normalized):', finalScore / 25);
    console.log('🎯 Risk Level:', finalScore / 25 < 0.3 ? 'LOW' : finalScore / 25 < 0.7 ? 'MEDIUM' : 'HIGH');

    console.log('### STEP 5 - Decision Layer Ended ###');

    return {
      techScore,
      nlpScore,
      finalScore,
      finalPrediction,
    };
  }

  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (score < 0.25) return 'low';
    if (score < 0.6) return 'medium';
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
