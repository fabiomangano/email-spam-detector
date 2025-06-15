import { Injectable } from '@nestjs/common';
import { EmailTechnicalMetrics } from '../../utils/types';

@Injectable()
export class TechnicalService {
  analyzeTechnical(parsedData: any): EmailTechnicalMetrics {
    return this.computeEmailMetrics(parsedData);
  }

  private computeEmailMetrics(parsedData: any): EmailTechnicalMetrics {
    const email = parsedData.parsed || parsedData;
    const allText = (email.htmlText || '') + (email.plainText || '');

    const numLinks = (allText.match(/https?:\/\//g) || []).length;
    const numImages = (
      (email.htmlText || '').match(/<img\s+[^>]*src=["']/gi) || []
    ).length;

    const trackingPixelRegex =
      /<img[^>]*(width="1"|height="1"|style="[^"]*(display:\s*none|opacity:\s*0)[^"]*")/i;

    const domains = new Set(
      [...(allText.matchAll(/https?:\/\/([^\s"'<>]+)/g) || [])].map(
        ([, domain]) => domain.replace(/\/$/, ''),
      ),
    );

    const replyTo = email.headers?.['reply-to'];
    const from = email.metadata?.from;

    return {
      bodyLength: allText.length,
      numLinks,
      linkRatio: Number((numLinks / Math.max(allText.length, 1)).toFixed(4)),
      numImages,
      hasTrackingPixel: trackingPixelRegex.test(email.htmlText || ''),
      hasAttachments: (email.attachments || []).length > 0,
      numAttachments: (email.attachments || []).length,
      attachmentTypes: (email.attachments || []).map((a: any) => a.contentType),
      spfResult:
        email.headers?.['authentication-results']?.match(/spf=([a-z]+)/i)?.[1],
      dkimResult:
        email.headers?.['authentication-results']?.match(/dkim=([a-z]+)/i)?.[1],
      dmarcResult:
        email.headers?.['authentication-results']?.match(/dmarc=([a-z]+)/i)?.[1],
      ipSender: this.extractSenderIpFromReceivedHeader(email.headers?.['received']),
      isHtmlOnly: !!(email.htmlText && !email.plainText),
      numDomains: domains.size,
      replyToDiffersFromFrom: !!(replyTo && from && !replyTo.text.includes(from)),
    };
  }

  private extractSenderIpFromReceivedHeader(
    receivedHeader: any,
  ): string | undefined {
    const receivedArray = Array.isArray(receivedHeader)
      ? receivedHeader
      : receivedHeader
        ? [receivedHeader]
        : [];
    const joined = receivedArray.join('\n');
    const ipMatch = joined.match(/from .*?\((\d{1,3}(?:\.\d{1,3}){3})\)/);
    return ipMatch?.[1];
  }
}
