import { EmailTechnicalMetrics } from './email-metrics';
import { BehaviorAnalysisResult } from './behavior.util';
import { NlpAnalysisResult } from './nlp.util';

interface DecisionMetrics {
  techScore: number;
  nlpScore: number;
  finalScore: number;
  finalPrediction: string;
}

export interface SpamAnalysisResult {
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  summary: string;
  details: {
    technical: EmailTechnicalMetrics;
    behavior: BehaviorAnalysisResult;
    nlp: NlpAnalysisResult;
  };
  recommendations: string[];
}

export function generateResult(
  technicalResult: EmailTechnicalMetrics,
  behaviorResult: BehaviorAnalysisResult,
  nlpResult: NlpAnalysisResult,
): Promise<SpamAnalysisResult> {
  // Usa il nuovo sistema di calcolo
  const decisionMetrics = calculateResult(technicalResult, nlpResult);
  
  // Calcola il behavior score separatamente (per compatibilità)
  const behaviorScore = calculateBehaviorScore(behaviorResult);
  
  // Il punteggio finale combina decision metrics e behavior
  const overallScore = Math.min((decisionMetrics.finalScore / 10) * 0.7 + behaviorScore * 0.3, 1);

  return Promise.resolve({
    overallScore,
    riskLevel: determineRiskLevel(overallScore),
    summary: generateSummary(overallScore),
    details: {
      technical: technicalResult,
      behavior: behaviorResult,
      nlp: nlpResult,
    },
    recommendations: generateRecommendations(overallScore),
  });
}

function calculateTechnicalScore(metrics: EmailTechnicalMetrics): number {
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

function calculateBehaviorScore(behavior: BehaviorAnalysisResult): number {
  return Math.min(
    (behavior.urgency.score + behavior.socialEngineering.score) / 2,
    1,
  );
}

function calculateNlpScore(nlpMetrics: any): number {
  let score = 0;

  // Penalizzazioni per parole spam
  if (nlpMetrics?.spamWordRatio > 0.05) score += 3;
  if (nlpMetrics?.numSpammyWords > 3) score += 2;

  // Penalizzazioni per uso di maiuscole o esclamazioni
  if (nlpMetrics?.allCapsCount > 5) score += 2;
  if (nlpMetrics?.exclamationCount > 3) score += 2;

  return score;
}

function calculateResult(
  technicalMetrics: EmailTechnicalMetrics,
  nlpOutput: any,
): DecisionMetrics {
  console.log('### STEP 5 - Decision Layer Started ###');

  // Calcola i punteggi
  const techScore = calculateTechnicalScore(technicalMetrics);
  const nlpScore = calculateNlpScore(nlpOutput?.nlpMetrics || {});

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

function determineRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score < 0.3) return 'low';
  if (score < 0.7) return 'medium';
  return 'high';
}

function generateSummary(score: number): string {
  if (score < 0.3)
    return 'Email appears to be legitimate with low spam indicators';
  if (score < 0.7)
    return 'Email shows some suspicious characteristics, exercise caution';
  return 'Email has high spam/phishing indicators, handle with extreme caution';
}

function generateRecommendations(score: number): string[] {
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