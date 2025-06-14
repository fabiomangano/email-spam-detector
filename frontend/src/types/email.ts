export interface EmailMetadata {
  messageId?: string;
  date?: string;
  from?: string;
  to?: string;
  subject?: string;
}

export interface EmailMetrics {
  spfResult?: string;
  dkimResult?: string;
  dmarcResult?: string;
}

export interface ParsedEmail {
  metadata?: EmailMetadata;
  plainText?: string;
  htmlText?: string;
}

export interface ParsedData {
  parsed?: ParsedEmail;
  metrics?: EmailMetrics;
}

export interface TechnicalAnalysisResult {
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
}

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

export interface PipelineResult {
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  summary: string;
  details: {
    technical: TechnicalAnalysisResult;
    behavior: BehaviorAnalysisResult;
    nlp: NlpAnalysisResult;
    parsing: ParsedData;
  };
  recommendations: string[];
}

export interface UploadResponse {
  filename: string;
  message?: string;
}

export type TabType = "gallery" | "messages";