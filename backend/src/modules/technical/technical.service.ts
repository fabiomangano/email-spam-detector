/* eslint-disable */
// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { EmailTechnicalMetrics, ParsedEmail } from '../../utils/types';

@Injectable()
export class TechnicalService {
  analyzeTechnical(parsedData: ParsedEmail): EmailTechnicalMetrics {
    return this.computeEmailMetrics(parsedData);
  }

  private computeEmailMetrics(parsedData: ParsedEmail): EmailTechnicalMetrics {
    const allText = (parsedData.htmlText || '') + (parsedData.plainText || '');

    const trackingPixelRegex =
      /<img[^>]*(width="1"|height="1"|style="[^"]*(display:\s*none|opacity:\s*0)[^"]*")/i;

    const domains = new Set(
      [...(allText.matchAll(/https?:\/\/([^\s"'<>]+)/g) || [])].map(
        ([, domain]) => domain.replace(/\/$/, ''),
      ),
    );

    const from = parsedData.metadata?.from;
    const replyTo = parsedData.headers?.['reply-to'];

    // METRICS
    // Lunghezza del formato html o del testo plain dell'email.
    const bodyLength = (parsedData.htmlText || parsedData.plainText || '').length;
    
    // Numero di link presenti in entrambi i formati dell'email.
    const numLinks = (allText.match(/https?:\/\//g) || []).length;
    
    // Numero di immagini presenti nel formato html dell'email.
    const numImages = (
      (parsedData.htmlText || '').match(/<img\s+[^>]*src=["']/gi) || []
    ).length;
    
    // Numero di link presenti all'interno di entrambi i formati dell'email.
    const linkRatio = Number(
      (numLinks / Math.max(allText.length, 1)).toFixed(4),
    );
    
    // Presenza di img con width/height pari a 1
    const hasTrackingPixel = trackingPixelRegex.test(parsedData.htmlText || '');
   
    // Presenza di allegati
    const hasAttachments = (parsedData.attachments || []).length > 0;
    
    // Numero di allegati
    const numAttachments = (parsedData.attachments || []).length;
    
    // Tipologia allegati
    const attachmentTypes = (parsedData.attachments || []).map(
      (a: any) => a.contentType,
    );
    
    // Valore del campo SPF
    const spfResult =
      parsedData.headers?.['authentication-results']?.match(/spf=([a-z]+)/i)?.[1];
    
    // Valore del campo DKIM
    const dkimResult =
      parsedData.headers?.['authentication-results']?.match(/dkim=([a-z]+)/i)?.[1];
    
    // Valore del campo DMARC
    const dmarcResult =
      parsedData.headers?.['authentication-results']?.match(/dmarc=([a-z]+)/i)?.[1];
    
    // IP del mittente
    const ipSender = this.extractSenderIpFromReceivedHeader(
      parsedData.headers?.['received'],
    );

    // Email solo in formato html
    const isHtmlOnly = !!(parsedData.htmlText && !parsedData.plainText);
    
    // Domini diversi tra i link   
    const numDomains = domains.size;

    // Rreply-to differente da From
    const replyToDiffersFromFrom = !!(
      replyTo &&
      from &&
      !replyTo.text.includes(from)
    );

    return {
      bodyLength,
      numLinks,
      linkRatio,
      numImages,
      hasTrackingPixel,
      hasAttachments,
      numAttachments,
      attachmentTypes,
      spfResult,
      dkimResult,
      dmarcResult,
      ipSender,
      isHtmlOnly,
      numDomains,
      replyToDiffersFromFrom,
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
