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

export interface UploadResponse {
  filename: string;
  message?: string;
}

export type TabType = "gallery" | "messages";