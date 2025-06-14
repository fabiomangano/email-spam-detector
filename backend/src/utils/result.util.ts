import { EmailTechnicalMetrics } from './email-metrics';
import { BehaviorAnalysisResult } from './behavior.util';
import { NlpAnalysisResult } from './nlp.util';

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
  // Calcola il punteggio complessivo basato sui risultati dei moduli
  const technicalScore = calculateTechnicalScore(technicalResult);
  const behaviorScore = calculateBehaviorScore(behaviorResult);
  const nlpScore = calculateNlpScore(nlpResult);

  const overallScore = (technicalScore + behaviorScore + nlpScore) / 3;

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

function calculateTechnicalScore(technical: EmailTechnicalMetrics): number {
  let score = 0;

  // Authentication checks
  if (technical.spfResult && technical.spfResult !== 'pass') score += 0.2;
  if (technical.dkimResult && technical.dkimResult !== 'pass') score += 0.2;
  if (technical.dmarcResult && technical.dmarcResult !== 'pass') score += 0.2;

  // Suspicious indicators
  if (technical.hasTrackingPixel) score += 0.1;
  if (technical.replyToDiffersFromFrom) score += 0.1;
  if (technical.isHtmlOnly) score += 0.05;

  // Link analysis
  if (technical.linkRatio > 0.1) score += 0.1;
  if (technical.numDomains > 5) score += 0.05;

  return Math.min(score, 1);
}

function calculateBehaviorScore(behavior: BehaviorAnalysisResult): number {
  return Math.min(
    (behavior.urgency.score + behavior.socialEngineering.score) / 2,
    1,
  );
}

function calculateNlpScore(nlp: NlpAnalysisResult): number {
  return Math.min(nlp.toxicity.score, 1);
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