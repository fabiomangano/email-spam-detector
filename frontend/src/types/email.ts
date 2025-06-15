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
  parsingOk: boolean;
  headers: Record<string, any>;
  plainText: string;
  htmlText: string;
  attachments: any[];
  metadata: EmailMetadata;
  warnings: string[];
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

export interface PipelineResult {
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  summary: string;
  details: {
    technical: TechnicalAnalysisResult;
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