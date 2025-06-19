import { ParsedMail } from 'mailparser';

export interface EmailMetadata {
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
  messageId?: string;
  mimeType?: string;
}

export interface ParsedEmailSuccess {
  parsingOk: true;
  headers: Record<string, any>;
  plainText: string;
  htmlText: string;
  attachments: ParsedMail['attachments'];
  metadata: EmailMetadata;
  warnings: string[];
}

export interface ParsedEmailFailure {
  parsingOk: false;
  headers: Record<string, any>;
  plainText: string;
  htmlText: string;
  attachments: [];
  metadata: Partial<EmailMetadata>;
  warnings: string[];
}

export type ParsedEmail = ParsedEmailSuccess | ParsedEmailFailure;

export interface EmailTechnicalMetrics {
  bodyLength: number;
  numLinks: number;
  linkRatio: number;
  numImages: number;
  hasTrackingPixel: boolean;
  hasAttachments: boolean;
  numAttachments: number;
  attachmentTypes: string[];
  spfResult?: string;
  dkimResult?: string;
  dmarcResult?: string;
  ipSender?: string;
  isHtmlOnly: boolean;
  numDomains: number;
  replyToDiffersFromFrom: boolean;
  // Header-based metrics
  numReceivedHeaders: number;
  hasOutlookReceivedPattern: boolean;
  xMailerBrand?: string;
  missingDateHeader: boolean;
  // From-based metrics
  fromNameSuspicious: boolean;
  fromDomainIsDisposable: boolean;
  sentToMultiple: boolean;
  // Campaign metrics
  campaignIdentifierPresent: boolean;
  containsFeedbackLoopHeader: boolean;
  // Text-based metrics
  uppercaseRatio: number;
  excessiveExclamations: boolean;
  containsUrgencyWords: boolean;
  containsElectionTerms: boolean;
  // Obfuscation and link metrics
  containsObfuscatedText: boolean;
  numExternalDomains: number;
  linkDisplayMismatch: boolean;
  containsShortenedUrls: boolean;
  usesEncodedUrls: boolean;
  linkToImageRatio: number;
  // MIME metrics
  hasMixedContentTypes: boolean;
  hasNestedMultipart: boolean;
  boundaryAnomaly: boolean;
  hasFakeMultipartAlternative: boolean;
  // New spam detection metrics
  isImageHeavy: boolean;
  hasRepeatedLinks: boolean;
  containsFinancialPromises: boolean;
  hasNonStandardPorts: boolean;
  containsSuspiciousDomains: boolean;
  mailingListSpam: boolean;
  hasSpammySubject: boolean;
  hasSuspiciousFromName: boolean;
}

export interface NlpAnalysisResult {
  tokens: string[];
  tfidfVector: number[];
  nlpMetrics: {
    numSpammyWords: number;
    spamWordRatio: number;
    allCapsCount: number;
    exclamationCount: number;
    tokens: string[];
  };
  prediction: string;
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

export interface DecisionMetrics {
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
    nlp: NlpAnalysisResult;
  };
  recommendations: string[];
  scores: {
    technicalScore: number;
    nlpScore: number;
    technicalPercentage: number;
    nlpPercentage: number;
  };
}