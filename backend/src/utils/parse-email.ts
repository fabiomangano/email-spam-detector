import * as fs from 'fs';
import { simpleParser, ParsedMail } from 'mailparser';

interface EmailMetadata {
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

export async function parseSingleEmail(filePath: string): Promise<ParsedEmail> {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed: ParsedMail = await simpleParser(raw);

    const html = parsed.html ?? '';
    const plain = parsed.text ?? '';

    const warnings: string[] = [];
    if (!plain) warnings.push('Missing plainText version.');
    if (!parsed.subject) warnings.push('Missing subject.');
    if (!parsed.from?.text) warnings.push('Missing sender.');
    if (!parsed.to?.text) warnings.push('Missing recipient.');

    return {
      parsingOk: true,
      headers: Object.fromEntries(parsed.headers),
      plainText: plain,
      htmlText: html,
      attachments: parsed.attachments,
      metadata: {
        subject: parsed.subject,
        from: parsed.from?.text,
        to: parsed.to?.text,
        date: parsed.date?.toISOString(),
        messageId: parsed.messageId,
        mimeType: parsed.headers.get('content-type')?.value,
      },
      warnings,
    };
  } catch (err) {
    return {
      parsingOk: false,
      headers: {},
      plainText: '',
      htmlText: '',
      attachments: [],
      metadata: {},
      warnings: [`Parsing failed: ${(err as Error).message}`],
    };
  }
}
