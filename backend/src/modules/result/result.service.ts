import { Injectable } from '@nestjs/common';
import {
  EmailTechnicalMetrics,
  NlpAnalysisResult,
  SpamAnalysisResult,
  DecisionMetrics,
} from '../../utils/types';
import { ConfigService } from '../config/config.service';
import { BehavioralAnalysisResult } from '../behavioral/behavioral.service';

@Injectable()
export class ResultService {
  constructor(private readonly configService: ConfigService) {}
  generateResult(
    technicalResult: EmailTechnicalMetrics,
    nlpResult: NlpAnalysisResult,
    behavioralResult?: BehavioralAnalysisResult,
  ): SpamAnalysisResult {
    // Usa il nuovo sistema di calcolo con analisi comportamentale
    const decisionMetrics = this.calculateResult(technicalResult, nlpResult, behavioralResult);

    // Il punteggio finale include technical, NLP e behavioral usando i pesi configurati
    // Normalizzazione che permette la distinzione tra diversi livelli di spam
    const overallScore = Math.min(decisionMetrics.finalScore / 22, 1);

    return {
      overallScore,
      riskLevel: this.determineRiskLevel(overallScore),
      summary: this.generateSummary(overallScore),
      details: {
        technical: technicalResult,
        nlp: nlpResult,
        behavioral: behavioralResult,
      },
      recommendations: this.generateRecommendations(overallScore),
      scores: {
        technicalScore: decisionMetrics.techScore,
        nlpScore: decisionMetrics.nlpScore,
        behavioralScore: decisionMetrics.behavioralScore || 0,
        technicalPercentage: Math.min(
          (decisionMetrics.techScore / 20) * 100,
          100,
        ),
        nlpPercentage: Math.min((decisionMetrics.nlpScore / 25) * 100, 100),
        behavioralPercentage: Math.min(((decisionMetrics.behavioralScore || 0) / 10) * 100, 100),
      },
    };
  }

  private calculateTechnicalScore(metrics: EmailTechnicalMetrics): number {
    let score = 0;
    const config = this.configService.getConfig();
    const penalties = config.technical.penalties;
    const thresholds = config.technical.thresholds;

    // === METRICHE BASE ===
    if (metrics.linkRatio > thresholds.links.highRatio)
      score += penalties.links.highRatio;
    if (metrics.numLinks > thresholds.links.excessive)
      score += penalties.links.excessive;
    if (metrics.numDomains > thresholds.domains.excessive)
      score += penalties.domains.excessive;
    if (metrics.hasTrackingPixel) score += penalties.tracking.hasTrackingPixel;
    if (metrics.replyToDiffersFromFrom)
      score += penalties.headers.replyToDiffers;
    if (metrics.hasAttachments) score += penalties.attachments.hasAttachments;

    // Penalità body length ridotta per domini fidati
    if (metrics.bodyLength < thresholds.bodyLength.veryShort) {
      const penalty = metrics.isFromTrustedDomain
        ? Math.round(penalties.bodyLength.veryShort * 0.3)
        : penalties.bodyLength.veryShort;
      score += penalty;
    } else if (metrics.bodyLength < thresholds.bodyLength.short) {
      const penalty = metrics.isFromTrustedDomain
        ? Math.round(penalties.bodyLength.short * 0.3)
        : penalties.bodyLength.short;
      score += penalty;
    }

    // === AUTENTICAZIONE EMAIL ===
    if (metrics.spfResult === 'fail') score += penalties.authentication.spfFail;
    if (metrics.spfResult === 'softfail')
      score += penalties.authentication.spfSoftfail;
    if (metrics.dkimResult === 'fail')
      score += penalties.authentication.dkimFail;
    if (metrics.dmarcResult === 'fail')
      score += penalties.authentication.dmarcFail;

    // === METRICHE HEADER ===
    if (metrics.numReceivedHeaders > thresholds.headers.excessiveReceived)
      score += penalties.headers.excessiveReceived;
    if (metrics.missingDateHeader) score += penalties.headers.missingDate;

    // === METRICHE MITTENTE ===
    if (metrics.fromNameSuspicious)
      score += penalties.sender.fromNameSuspicious;
    if (metrics.fromDomainIsDisposable)
      score += penalties.sender.fromDomainDisposable;
    if (metrics.sentToMultiple) score += penalties.sender.sentToMultiple;

    // === METRICHE CAMPAGNA ===
    if (metrics.campaignIdentifierPresent)
      score += penalties.campaign.campaignIdentifier;
    if (metrics.containsFeedbackLoopHeader)
      score += penalties.campaign.feedbackLoopHeader;

    // === METRICHE TESTUALI ===
    if (metrics.uppercaseRatio > thresholds.text.uppercaseRatio)
      score += penalties.text.uppercaseExcessive;
    if (metrics.excessiveExclamations)
      score += penalties.text.excessiveExclamations;
    // Non penalizzare urgency words se è un evento legittimo (eventi hanno spesso scadenze)
    if (metrics.containsUrgencyWords && !metrics.isEventEmail)
      score += penalties.text.urgencyWords;
    if (metrics.containsElectionTerms) score += penalties.text.electionTerms;

    // === METRICHE OFFUSCAMENTO E LINK ===
    if (metrics.containsObfuscatedText)
      score += penalties.obfuscation.obfuscatedText;
    if (metrics.numExternalDomains > thresholds.domains.externalExcessive)
      score += penalties.domains.externalExcessive;
    if (metrics.linkDisplayMismatch)
      score += penalties.obfuscation.linkDisplayMismatch;
    if (metrics.containsShortenedUrls)
      score += penalties.obfuscation.shortenedUrls;
    if (metrics.usesEncodedUrls) score += penalties.obfuscation.encodedUrls;
    if (metrics.linkToImageRatio > thresholds.text.linkToImageRatio)
      score += penalties.text.uppercaseExcessive;
    if (metrics.containsFinancialPromises)
      score += penalties.spam.financialPromises;
    if (metrics.hasNonStandardPorts) score += penalties.spam.nonStandardPorts;
    if (metrics.containsSuspiciousDomains)
      score += penalties.spam.suspiciousDomains;
    if (metrics.mailingListSpam) score += penalties.spam.mailingListSpam;
    if (metrics.hasSpammySubject) score += penalties.spam.spammySubject;
    if (metrics.hasSuspiciousFromName)
      score += penalties.spam.suspiciousFromName;

    // === METRICHE MIME ===
    if (metrics.hasMixedContentTypes) score += penalties.mime.mixedContentTypes;
    if (metrics.hasNestedMultipart) score += penalties.mime.nestedMultipart;
    if (metrics.boundaryAnomaly) score += penalties.mime.boundaryAnomaly;
    if (metrics.hasFakeMultipartAlternative)
      score += penalties.mime.fakeMultipartAlternative;

    // === NUOVE METRICHE SPAM ===
    if (metrics.isImageHeavy) score += penalties.images.heavy;
    if (metrics.hasRepeatedLinks) score += penalties.spam.repeatedLinks;

    // === RIDUZIONI PER EMAIL LEGITTIME ===
    let legitimacyBonus = 0;

    // Dominio fidato riduce significativamente il punteggio
    if (metrics.isFromTrustedDomain) {
      legitimacyBonus += 6; // Forte riduzione per domini fidati
    }

    // Email di eventi legittimi
    if (metrics.isEventEmail) {
      legitimacyBonus += 4; // Riduzione per eventi
      // Riduci penalità per tracking pixel se è un evento legittimo
      if (metrics.hasTrackingPixel) {
        legitimacyBonus += 2; // Compensa la penalità tracking pixel
      }
    }

    // Newsletter legittima
    if (metrics.isNewsletterEmail) {
      legitimacyBonus += 3; // Riduzione per newsletter
      // Riduci penalità per multipli destinatari se è newsletter
      if (metrics.sentToMultiple) {
        legitimacyBonus += 1; // Compensa penalità destinatari multipli
      }
    }

    // Unsubscribe corretto
    if (metrics.hasProperUnsubscribe) {
      legitimacyBonus += 2; // Piccolo bonus per unsubscribe corretto
    }

    // === SUPER BONUS PER COMBINAZIONI SPAM EVIDENTI ===
    let spamIndicators = 0;
    if (metrics.sentToMultiple && !metrics.isNewsletterEmail) spamIndicators++;
    if (metrics.containsFinancialPromises) spamIndicators++;
    if (metrics.hasSpammySubject) spamIndicators++;
    if (metrics.hasSuspiciousFromName) spamIndicators++;
    if (metrics.isHtmlOnly && !metrics.isEventEmail) spamIndicators++;

    // Super bonus quando 3+ indicatori spam sono presenti
    if (spamIndicators >= 3) score += 6; // Clear spam pattern
    if (spamIndicators >= 4) score += 4; // Very clear spam pattern

    // Applica il bonus di legittimità (sottrae dal punteggio spam)
    score = Math.max(0, score - legitimacyBonus);

    return score;
  }

  private calculateNlpScore(
    nlpOutput: any,
    technicalMetrics?: EmailTechnicalMetrics,
  ): number {
    let score = 0;
    const config = this.configService.getConfig();
    const multipliers = config.nlp.multipliers;
    const thresholds = config.nlp.thresholds;
    const nlpMetrics = nlpOutput?.nlpMetrics;

    // RIDUZIONE PER EMAIL LEGITTIME - Controlla se è legittima prima di penalizzare
    let legitimacyDetected = false;
    if (technicalMetrics) {
      legitimacyDetected =
        technicalMetrics.isFromTrustedDomain ||
        technicalMetrics.isEventEmail ||
        technicalMetrics.isNewsletterEmail ||
        technicalMetrics.hasProperUnsubscribe;
    }

    // Penalizzazioni per parole spam (ridotte se legittima)
    if (
      nlpMetrics?.spamWordRatio &&
      nlpMetrics.spamWordRatio > thresholds.spamWordRatio
    ) {
      const spamWordPenalty = Math.round(
        nlpMetrics.spamWordRatio * 10 * multipliers.spamWords,
      );
      score += legitimacyDetected
        ? Math.round(spamWordPenalty * 0.3)
        : spamWordPenalty;
    }

    // BONUS SIGNIFICATIVO per prediction del modello NLP (ridotto per legittime)
    if (nlpOutput?.prediction === 'spam') {
      if (legitimacyDetected) {
        // Se è da dominio fidato o evento, riduci drasticamente il punteggio NLP
        score += 2; // Molto ridotto invece di 10
      } else {
        score += 10; // Base bonus for spam prediction

        // Bonus aggiuntivo basato su confidence del sentiment o toxicity
        if (nlpOutput?.toxicity?.score > thresholds.toxicity.medium) {
          score += Math.round(
            nlpOutput.toxicity.score * 10 * multipliers.toxicity,
          );
        }
        if (nlpOutput?.sentiment?.score < thresholds.sentiment.negative) {
          score += Math.round(
            Math.abs(nlpOutput.sentiment.score) *
              10 *
              multipliers.sentiment.negative,
          );
        }
      }
    }

    return score;
  }

  private calculateBehavioralScore(behavioral: BehavioralAnalysisResult): number {
    console.log('🎭 === BEHAVIORAL SCORING STARTED ===');
    let score = 0;

    // New sender penalty (0-3 points)
    if (behavioral.isNewSender) {
      score += 2;
      console.log('🆕 New sender penalty: +2');
    }

    // High volume sending penalty (0-4 points)
    if (behavioral.emailCountLast24h > 50) {
      score += 4;
      console.log('📧 Very high volume (>50 emails/24h): +4');
    } else if (behavioral.emailCountLast24h > 20) {
      score += 3;
      console.log('📧 High volume (>20 emails/24h): +3');
    } else if (behavioral.emailCountLast24h > 10) {
      score += 2;
      console.log('📧 Medium volume (>10 emails/24h): +2');
    }

    // Burst ratio penalty (0-3 points)
    if (behavioral.burstRatio > 10) {
      score += 3;
      console.log('⚡ Very high burst ratio (>10): +3');
    } else if (behavioral.burstRatio > 5) {
      score += 2;
      console.log('⚡ High burst ratio (>5): +2');
    } else if (behavioral.burstRatio > 3) {
      score += 1;
      console.log('⚡ Medium burst ratio (>3): +1');
    }

    // Content similarity penalty for mass mailing (0-3 points)
    if (behavioral.contentSimilarityRate > 0.9) {
      score += 3;
      console.log('📄 Very high content similarity (>90%): +3');
    } else if (behavioral.contentSimilarityRate > 0.7) {
      score += 2;
      console.log('📄 High content similarity (>70%): +2');
    } else if (behavioral.contentSimilarityRate > 0.5) {
      score += 1;
      console.log('📄 Medium content similarity (>50%): +1');
    }

    // Time anomaly penalty (0-2 points)
    if (behavioral.timeAnomalyScore > 0.8) {
      score += 2;
      console.log('🕐 High time anomaly (unusual sending time): +2');
    } else if (behavioral.timeAnomalyScore > 0.5) {
      score += 1;
      console.log('🕐 Medium time anomaly: +1');
    }

    // Subject change rate penalty for randomized subjects (0-2 points)
    if (behavioral.subjectChangeRate > 0.9) {
      score += 2;
      console.log('📝 Very high subject change rate (randomized): +2');
    } else if (behavioral.subjectChangeRate > 0.7) {
      score += 1;
      console.log('📝 High subject change rate: +1');
    }

    // Mass mailing indicator (0-2 points)
    if (behavioral.massMailingIndicator) {
      score += 2;
      console.log('📮 Mass mailing indicator: +2');
    }

    // Low reputation penalty (0-3 points)
    if (behavioral.reputationScore < 0.2) {
      score += 3;
      console.log('⭐ Very low reputation (<0.2): +3');
    } else if (behavioral.reputationScore < 0.4) {
      score += 2;
      console.log('⭐ Low reputation (<0.4): +2');
    } else if (behavioral.reputationScore < 0.6) {
      score += 1;
      console.log('⭐ Medium-low reputation (<0.6): +1');
    }

    console.log('🎭 Total Behavioral Score:', score);
    console.log('🎭 === BEHAVIORAL SCORING ENDED ===');
    
    return score;
  }

  private calculateResult(
    technicalMetrics: EmailTechnicalMetrics,
    nlpOutput: any,
    behavioralResult?: BehavioralAnalysisResult,
  ): DecisionMetrics {
    console.log('### STEP 5 - Decision Layer Started ###');

    // Calcola i punteggi
    const techScore = this.calculateTechnicalScore(technicalMetrics);
    const nlpScore = this.calculateNlpScore(nlpOutput, technicalMetrics);
    const behavioralScore = behavioralResult ? this.calculateBehavioralScore(behavioralResult) : 0;

    const config = this.configService.getConfig();
    const weights = config.scoring.weights;

    // Calcola il punteggio finale usando i pesi configurati
    const finalScore = techScore * weights.technical + nlpScore * weights.nlp + behavioralScore * (weights.behavioral || 0.2);

    // Soglia di decisione basata solo sul punteggio finale pesato
    // Rimossa la regola di override che forzava spam prediction
    const isSpam = finalScore > 8; // Soglia più bilanciata

    const finalPrediction = isSpam ? 'spam' : 'ham';

    console.log('📦 Technical Score:', techScore);
    console.log('🧠 NLP Score:', nlpScore);
    console.log('🎭 Behavioral Score:', behavioralScore);
    console.log('📊 Final Score:', finalScore);
    console.log('📌 Final Prediction:', finalPrediction);
    console.log('📈 Overall Score (normalized):', finalScore / 22);
    console.log('🔍 Detailed calculation: (' + techScore + ' × 0.6) + (' + nlpScore + ' × 0.25) + (' + behavioralScore + ' × 0.15) = ' + finalScore);
    console.log('🔍 Final calculation: ' + finalScore + ' / 22 = ' + (finalScore / 22));
    console.log(
      '🎯 Risk Level:',
      finalScore / 22 < 0.3 ? 'LOW' : finalScore / 22 < 0.7 ? 'MEDIUM' : 'HIGH',
    );

    console.log('### STEP 5 - Decision Layer Ended ###');

    return {
      techScore,
      nlpScore,
      behavioralScore,
      finalScore,
      finalPrediction,
    };
  }

  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' {
    const config = this.configService.getConfig();
    const riskLevels = config.scoring.riskLevels;

    if (score < riskLevels.low) return 'low';
    if (score < riskLevels.medium) return 'medium';
    return 'high';
  }

  private generateSummary(score: number): string {
    const config = this.configService.getConfig();
    const riskLevels = config.scoring.riskLevels;

    if (score < riskLevels.low)
      return 'Email appears to be legitimate with low spam indicators';
    if (score < riskLevels.medium)
      return 'Email shows some suspicious characteristics, exercise caution';
    return 'Email has high spam/phishing indicators, handle with extreme caution';
  }

  private generateRecommendations(score: number): string[] {
    const config = this.configService.getConfig();
    const riskLevels = config.scoring.riskLevels;
    const recommendations: string[] = [];

    if (score > riskLevels.low) {
      recommendations.push('Verify sender identity through alternative means');
    }
    if (score > riskLevels.medium) {
      recommendations.push('Do not click on any links or download attachments');
    }
    if (score > riskLevels.medium * 1.4) {
      recommendations.push('Consider reporting this email as spam/phishing');
    }
    return recommendations;
  }
}
