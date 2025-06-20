import { Injectable } from '@nestjs/common';
import { ParsedEmail } from '../../utils/types';
import * as fs from 'fs';
import * as path from 'path';
import { simpleParser, ParsedMail } from 'mailparser';

@Injectable()
export class ParsingService {
  async parseEmailFile(filename: string): Promise<{
    parsed: ParsedEmail;
  }> {
    const filePath = path.join(process.cwd(), 'storage', filename);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filename}`);
    }

    const parsed = await this.parseSingleEmail(filePath);
    return { parsed };
  }

  async parseEmailContent(content: string): Promise<{
    parsed: ParsedEmail;
  }> {
    const parsed = await this.parseEmailFromContent(content);
    return { parsed };
  }

  private async parseSingleEmail(filePath: string): Promise<ParsedEmail> {
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = await simpleParser(raw) as ParsedMail;

      const html = parsed.html?.toString() ?? '';
      const plain = parsed.text?.toString() ?? '';

      const warnings: string[] = [];
      if (!plain) warnings.push('Missing plainText version.');
      if (!parsed.subject) warnings.push('Missing subject.');
      if (!parsed.from?.text) warnings.push('Missing sender.');
      if (!parsed.to?.text) warnings.push('Missing recipient.');

      return {
        parsingOk: true,
        headers: Object.fromEntries(parsed.headers || new Map()),
        plainText: plain,
        htmlText: html,
        attachments: parsed.attachments || [],
        metadata: {
          subject: parsed.subject || undefined,
          from: parsed.from?.text || undefined,
          to: parsed.to?.text || undefined,
          date: parsed.date?.toISOString() || undefined,
          messageId: parsed.messageId || undefined,
          mimeType: parsed.headers?.get('content-type')?.value || undefined,
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

  private async parseEmailFromContent(content: string): Promise<ParsedEmail> {
    try {
      const parsed = await simpleParser(content) as ParsedMail;

      const html = parsed.html?.toString() ?? '';
      const plain = parsed.text?.toString() ?? '';

      const warnings: string[] = [];
      if (!plain) warnings.push('Missing plainText version.');
      if (!parsed.subject) warnings.push('Missing subject.');
      if (!parsed.from?.text) warnings.push('Missing sender.');
      if (!parsed.to?.text) warnings.push('Missing recipient.');

      return {
        parsingOk: true,
        headers: Object.fromEntries(parsed.headers || new Map()),
        plainText: plain,
        htmlText: html,
        attachments: parsed.attachments || [],
        metadata: {
          subject: parsed.subject || undefined,
          from: parsed.from?.text || undefined,
          to: parsed.to?.text || undefined,
          date: parsed.date?.toISOString() || undefined,
          messageId: parsed.messageId || undefined,
          mimeType: parsed.headers?.get('content-type')?.value || undefined,
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
}
