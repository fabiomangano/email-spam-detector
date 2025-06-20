/* eslint-disable */
// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { EmailTechnicalMetrics, ParsedEmail } from '../../utils/types';
import { ConfigService } from '../config/config.service';

// These will be replaced by config values

@Injectable()
export class TechnicalService {
  constructor(private readonly configService: ConfigService) {}
  analyzeTechnical(parsedData: ParsedEmail): EmailTechnicalMetrics {
    return this.computeEmailMetrics(parsedData);
  }

  private computeEmailMetrics(parsedData: ParsedEmail): EmailTechnicalMetrics {
    const config = this.configService.getConfig();
    const domains = config.domains;
    const keywords = config.keywords;
    const thresholds = config.technical.thresholds;
    
    const allText = (parsedData.htmlText || '') + (parsedData.plainText || '');

    const trackingPixelRegex =
      /<img[^>]*(width="?1"?|height="?1"?|style="[^"]*(display:\s*none|opacity:\s*0)[^"]*")/i;

    const linkDomains = new Set(
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
    const numDomains = linkDomains.size;

    // Rreply-to differente da From
    const replyToDiffersFromFrom = !!(
      replyTo &&
      from &&
      !replyTo.text.includes(from)
    );

    // === NUOVE METRICHE ===
    
    // Metriche basate sugli header
    // Numero di header "Received" - troppi hop possono mascherare la provenienza
    const numReceivedHeaders = Array.isArray(parsedData.headers?.received) 
      ? parsedData.headers.received.length 
      : parsedData.headers?.received ? 1 : 0;
      
    // Verifica presenza server Outlook nella catena SMTP - aiuta a distinguere flussi legittimi
    const hasOutlookReceivedPattern = Array.isArray(parsedData.headers?.received)
      ? parsedData.headers.received.some(h => /outlook\.com/i.test(h))
      : parsedData.headers?.received ? /outlook\.com/i.test(parsedData.headers.received) : false;
      
    // Valore di X-Mailer o User-Agent - identifica software noto per spam
    const xMailerBrand = parsedData.headers?.['x-mailer'] || 
                        parsedData.headers?.['user-agent'] || 
                        parsedData.headers?.['x-mailer'];
                        
    // Verifica assenza o anomalia header Date - email malformate sono sospette
    const missingDateHeader = !parsedData.headers?.date;

    // Metriche basate sul mittente
    const fromName = parsedData.headers?.from?.value?.[0]?.name || '';
    // Nome mittente sospetto (tutto maiuscolo, generico, o con caratteri strani) - maschera l'identità reale
    const fromNameSuspicious = (/^[A-Z\s]+$/.test(fromName) && fromName.length > 10) ||
                               /[*#@$%^&+=<>{}[\]|\\]/.test(fromName) ||
                               /OWNER-|NOLIST-|ADMIN-|SYSTEM-/.test(fromName);
    
    const fromAddress = parsedData.headers?.from?.value?.[0]?.address || '';
    const fromDomain = fromAddress.split('@')[1] || '';
    // Dominio del mittente è noto come temporaneo - email usa mittenti temporanei
    const fromDomainIsDisposable = domains.disposable.includes(fromDomain.toLowerCase());
    
    // Email inviata a più destinatari visibili - non è una comunicazione personale
    const toHeader = parsedData.headers?.to || parsedData.metadata?.to || '';
    const ccHeader = parsedData.headers?.cc || '';
    
    // Conta il numero totale di indirizzi email nei campi To e Cc
    const toCount = (typeof toHeader === 'string') ? (toHeader.match(/@/g) || []).length : 
                    (Array.isArray(toHeader) ? toHeader.length : 0);
    const ccCount = (typeof ccHeader === 'string') ? (ccHeader.match(/@/g) || []).length : 
                    (Array.isArray(ccHeader) ? ccHeader.length : 0);
    
    const totalRecipients = toCount + ccCount;
    const sentToMultiple = totalRecipients > 1;

    // Metriche di campagna e mailing list
    const campaignHeaders = ['x-rpcampaign', 'list-help', 'feedback-id', 'list-unsubscribe'];
    // Presenza header di campagna - indica mailing list, newsletter o campagne massive
    const campaignIdentifierPresent = campaignHeaders.some(header => 
      parsedData.headers?.[header] !== undefined
    );
    
    const feedbackHeaders = ['x-csa-complaints', 'cfbl-address', 'feedback-id', 'x-abuse'];
    // Header per loop FBL - email commerciale da provider autoregolamentato
    const containsFeedbackLoopHeader = feedbackHeaders.some(header => 
      parsedData.headers?.[header] !== undefined
    );

    // Metriche semantiche e testuali
    const plainTextLower = (parsedData.plainText || '').toLowerCase();
    const totalChars = parsedData.plainText?.length || 0;
    const upperCaseChars = (parsedData.plainText?.match(/[A-Z]/g) || []).length;
    // Percentuale di testo in MAIUSCOLO - comunicazione aggressiva tipica dello spam
    const uppercaseRatio = totalChars > 0 ? upperCaseChars / totalChars : 0;
    
    // Molti punti esclamativi consecutivi - tecnica classica per attirare attenzione
    const excessiveExclamations = /!{3,}/.test(allText);
    
    // Parole di urgenza ("urgente", "immediato") - linguaggio pressante tipico di phishing/scam
    const containsUrgencyWords = keywords.urgency.some(word => 
      plainTextLower.includes(word.toLowerCase())
    );
    
    // Parole chiave elettorali ("voto", "delegati") - campagne massive o phishing tematico
    const containsElectionTerms = keywords.election.some(word => 
      plainTextLower.includes(word.toLowerCase())
    );

    // Metriche di offuscamento e link
    // Caratteri Unicode, simboli rari, HTML offuscato - usato per evadere filtri
    const containsObfuscatedText = 
      /\\u[0-9A-Fa-f]{4}/.test(allText) || // Escape Unicode
      /%[0-9A-Fa-f]{2}/.test(allText) || // Encoding percentuale
      /[\u200B\u200C\u200D\uFEFF]/.test(allText); // Caratteri a larghezza zero
      
    const links = [...allText.matchAll(/https?:\/\/[^\s"'<>]+/g)].map(m => m[0]);
    const externalDomains = new Set();
    
    links.forEach(link => {
      try {
        const url = new URL(link);
        externalDomains.add(url.hostname.toLowerCase());
      } catch (e) {
        // URL invalido, ignora
      }
    });
    
    // Conta domini esterni nei link - molti domini probabilmente redirect o phishing
    const numExternalDomains = externalDomains.size;
    
    // Link testuale diverso da URL reale - tecnica di inganno
    const linkDisplayMismatch = /<a[^>]+href="([^"]*)"[^>]*>([^<]*)<\/a>/gi.test(parsedData.htmlText || '') &&
      [...(parsedData.htmlText || '').matchAll(/<a[^>]+href="([^"]*)"[^>]*>([^<]*)<\/a>/gi)]
        .some(match => match[1] !== match[2] && !match[2].includes('...'));
    
    // Usa accorciatori di URL (bit.ly, t.co) - maschera reale destinazione
    const containsShortenedUrls = domains.urlShorteners.some(shortener => 
      allText.toLowerCase().includes(shortener)
    );
    
    // URL con encoding percentuale - può mascherare redirect o link fraudolenti
    const usesEncodedUrls = links.some(link => /%[0-9A-Fa-f]{2}/.test(link));
    
    // Rapporto link/immagini - troppi link rispetto a contenuti visivi
    const linkToImageRatio = numImages > 0 ? numLinks / numImages : numLinks;
    
    // Nuove metriche per spam basato su immagini
    const isImageHeavy = numImages > thresholds.images.heavyCount && (parsedData.plainText || '').length < thresholds.images.heavyTextLimit;
    const hasRepeatedLinks = links.length > 3 && 
      new Set(links.map(link => {
        try { return new URL(link).hostname; } catch { return link; }
      })).size === 1;

    // Metriche MIME e struttura
    const contentType = parsedData.headers?.['content-type']?.value || '';
    // Email ha tipi MIME misti - struttura complessa può nascondere contenuti
    const hasMixedContentTypes = /multipart\/mixed/i.test(contentType);
    
    // MIME annidati (multipart dentro multipart) - può mascherare allegati o codice
    const hasNestedMultipart = /multipart/i.test(contentType) && 
      (parsedData.htmlText || '').includes('multipart');
      
    const boundary = parsedData.headers?.['content-type']?.params?.boundary || '';
    // Boundary MIME troppo lunghi o casuali - segnale di generazione automatica
    const boundaryAnomaly = boundary.length > thresholds.mime.boundaryMaxLength || 
      /[^a-zA-Z0-9\-_=]/.test(boundary.replace(/[=_-]/g, ''));
      
    // MIME alternative ma manca il text/plain - finge compatibilità ma nasconde contenuti
    const hasFakeMultipartAlternative = /multipart\/alternative/i.test(contentType) && 
      (!parsedData.plainText || parsedData.plainText.trim().length === 0);

    // NUOVE METRICHE PER LEGITTIME EMAIL
    const isFromTrustedDomain = this.isFromTrustedDomain(fromDomain);
    const isEventEmail = this.isEventEmail(allText, parsedData.metadata?.subject || '');
    const isNewsletterEmail = this.isNewsletterEmail(allText, parsedData);
    const hasProperUnsubscribe = this.hasProperUnsubscribe(parsedData, allText);

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
      // New header-based metrics
      numReceivedHeaders,
      hasOutlookReceivedPattern,
      xMailerBrand,
      missingDateHeader,
      // New from-based metrics
      fromNameSuspicious,
      fromDomainIsDisposable,
      sentToMultiple,
      // New campaign metrics
      campaignIdentifierPresent,
      containsFeedbackLoopHeader,
      // New text-based metrics
      uppercaseRatio,
      excessiveExclamations,
      containsUrgencyWords,
      containsElectionTerms,
      // New obfuscation and link metrics
      containsObfuscatedText,
      numExternalDomains,
      linkDisplayMismatch,
      containsShortenedUrls,
      usesEncodedUrls,
      linkToImageRatio,
      // New MIME metrics
      hasMixedContentTypes,
      hasNestedMultipart,
      boundaryAnomaly,
      hasFakeMultipartAlternative,
      // New spam detection metrics
      isImageHeavy,
      hasRepeatedLinks,
      containsFinancialPromises: this.detectFinancialPromises(allText),
      hasNonStandardPorts: this.detectNonStandardPorts(allText),
      containsSuspiciousDomains: this.detectSuspiciousDomains(allText),
      mailingListSpam: this.detectMailingListSpam(parsedData, allText),
      hasSpammySubject: this.detectSpammySubject(parsedData.metadata?.subject || ''),
      hasSuspiciousFromName: this.detectSuspiciousFromName(fromAddress),
      // New legitimate email detection metrics
      isFromTrustedDomain,
      isEventEmail,
      isNewsletterEmail,
      hasProperUnsubscribe,
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

  private detectFinancialPromises(text: string): boolean {
    const financialPatterns = [
      /\$[\d,]+(?:\.\d{2})?/i,          // $100,000 or $1,000.00
      /[\d,]+\s*(?:dollars?|usd|eur|gbp|pounds?)/i,  // 100000 dollars
      /(?:million|thousand|billion)\s*(?:dollars?|usd|eur|gbp|pounds?)/i,
      /(?:win|earn|make|receive|get|claim)\s*(?:up\s*to\s*)?\$[\d,]+/i,
      /guaranteed\s*(?:income|money|profit|return)/i,
      /(?:inheritance|fund|transfer|compensation|settlement)\s*of\s*\$?[\d,]+/i,
      /(?:attorney|lawyer|legal)\s*(?:fee|fees|claim|fund)/i,
      /(?:beneficiary|next\s*of\s*kin|deceased)/i,
      /(?:direct\s*)?e-?mail\s*marketing/i,          // Email marketing services
      /(?:mlm|network\s*marketing|pyramid)/i,        // MLM schemes
      /(?:bulk\s*email|mass\s*email|email\s*blast)/i, // Bulk email services
      /(?:\d+\s*million|million\s*e-?mails?)\s*delivered/i, // Million emails delivered
      /work\s*(?:from|at)\s*home/i,                  // Work from home schemes
      /(?:substantial|excellent|vast)\s*income/i,     // Income promises
      /(?:fortune\s*500|immediate\s*help\s*needed)/i, // Job scam patterns
      /(?:no\s*experience\s*(?:required|needed))/i,    // No experience required
      /save\s*(?:up\s*to\s*)?\d+%/i,                   // Save up to X% offers
      /(?:free|lowest)\s*(?:access|rates|quote)/i,     // Free access/quote offers
      /hundreds\s*or\s*(?:even\s*)?thousands/i,        // Hundreds or thousands promise
      /(?:lose|drop)\s*\d+(?:-\d+)?\s*(?:lbs?|pounds?|kg)/i, // Weight loss promises
      /(?:free|get)\s*(?:legal|child\s*support)/i,     // Legal/support offers
      /(?:singles|dating)\s*community/i,               // Dating site promotions
      /fight\s*the\s*risk/i,                          // Health scare tactics
      /photo\s*album\s*online/i,                      // Photo sharing spam
      /(?:direct\s*)?email\s*advertising/i,           // Email advertising services
      /(?:multiply|maximize)\s*your\s*(?:customer|marketing)/i, // Marketing spam
      /(?:\$\d+\s*per\s*(?:\d+\s*)?million)/i,        // Pricing per million
      /marketing\s*(?:needs|dollars)/i,               // Marketing terminology
      /(?:fax|complete).+form/i,                      // Fax forms (spam technique)
      /consultant\s*will\s*contact/i,                 // Sales contact promises
      /(?:cents?|minutes?)\s*per\s*minute/i,          // Per-minute pricing
      /(?:lowest|best|highest)\s*(?:rate|quality|price)/i, // Superlative pricing claims
      /(?:no\s*setup\s*fees?|no\s*contracts?)/i,      // No fees promises
      /fill\s*out\s*the\s*form/i,                     // Form filling requests
      /submit\s*information/i,                        // Data collection
      /required\s*input\s*field/i                     // Form requirements
    ];
    
    return financialPatterns.some(pattern => pattern.test(text));
  }

  private detectNonStandardPorts(text: string): boolean {
    // Rileva URL con porte non standard (non 80, 443, 25, 587, 993, 995)
    const nonStandardPortPattern = /https?:\/\/[^\s"'<>]*:(?!80|443|25|587|993|995)\d+/i;
    return nonStandardPortPattern.test(text);
  }

  private detectSuspiciousDomains(text: string): boolean {
    const config = this.configService.getConfig();
    const suspiciousDomains = config.domains.suspicious;
    
    return suspiciousDomains.some(domain => {
      if (domain.startsWith('.')) {
        // Domain extensions like .cn, .tk
        const regex = new RegExp('\\' + domain + '\\b', 'i');
        return regex.test(text);
      } else {
        // Specific domains
        return text.toLowerCase().includes(domain.toLowerCase());
      }
    });
  }

  private detectMailingListSpam(parsedData: ParsedEmail, text: string): boolean {
    // Rileva spam che si maschera come mailing list legittima
    const hasMailingListHeaders = !!(
      parsedData.headers?.['list-id'] ||
      parsedData.headers?.['x-mailman-version'] ||
      parsedData.headers?.['precedence'] === 'bulk'
    );

    if (!hasMailingListHeaders) return false;

    // Pattern di contenuto commerciale/spam tipici
    const spamContentPatterns = [
      /guaranteed\s*to\s*lose/i,           // Weight loss guarantees
      /fight\s*the\s*risk\s*of/i,          // Health scare tactics
      /free\s*legal\s*advice/i,            // Legal offers
      /fastest\s*growing\s*singles/i,      // Dating site promotions
      /private\s*photo\s*album/i,          // Adult content hints
      /offer\s*manager/i,                  // Commercial signatures
      /prizemama/i,                        // Promotional company names
      /adclick\.ws/i,                      // Known spam domains
      /\d+\)\s*.+http/i,                   // Numbered list with links (1) Text http://...)
    ];

    const hasSpamContent = spamContentPatterns.some(pattern => pattern.test(text));

    // Se ha header di mailing list MA contenuto spam → probabile hijack
    return hasSpamContent;
  }

  private detectSpammySubject(subject: string): boolean {
    const spammySubjectPatterns = [
      /guaranteed\s*to\s*(?:lose|win|make|earn)/i,    // Guaranteed promises
      /(?:free|win|earn)\s*(?:money|cash|prizes?)/i,  // Free money offers
      /lose\s*\d+(?:-\d+)?\s*(?:lbs?|pounds?)/i,      // Weight loss in subject
      /\$\d+(?:,\d{3})*(?:\.\d{2})?/i,               // Money amounts in subject
      /(?:urgent|immediate|act\s*now|limited\s*time)/i, // Urgency words
      /(?:click\s*here|visit\s*now|order\s*today)/i,  // Action words
      /(?:amazing|incredible|unbelievable)\s*(?:offer|deal)/i, // Hyperbolic claims
      /(?:\$[\d.]+|[\d.]+\s*cents?)\s*per\s*minute/i, // Per-minute pricing in subject
      /(?:best|lowest|highest)\s*(?:quality|rate|price)/i, // Quality/pricing claims
      /(?:conference|conferencing)\s*(?:calls?|made\s*easy)/i // Conference service promotion
    ];
    
    return spammySubjectPatterns.some(pattern => pattern.test(subject));
  }

  private detectSuspiciousFromName(fromAddress: string): boolean {
    const namePart = fromAddress.split('@')[0] || '';
    
    // Pattern sospetti per nomi mittente
    const suspiciousPatterns = [
      /^[a-z]{4,8}\d{8,16}$/i,        // Pattern come suz0123893616943
      /^[a-z]{2,5}\d{4,}$/i,          // Pattern brevi con molti numeri
      /^[bcdfghjklmnpqrstvwxyz]{4,}$/i, // Solo consonanti (gibberish)
      /^.{15,}$/,                     // Nomi molto lunghi (>15 caratteri)
      /\d{8,}/,                       // 8+ cifre consecutive
      /^(test|temp|admin|user)\d+$/i, // Nomi di test generici
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(namePart));
  }

  private isFromTrustedDomain(domain: string): boolean {
    const config = this.configService.getConfig();
    const trustedDomains = config.domains.trusted || [];
    
    return trustedDomains.some(trustedDomain => {
      const normalizedDomain = domain.toLowerCase();
      const normalizedTrusted = trustedDomain.toLowerCase();
      
      return normalizedDomain === normalizedTrusted || 
             normalizedDomain.endsWith('.' + normalizedTrusted);
    });
  }

  private isEventEmail(text: string, subject: string): boolean {
    const config = this.configService.getConfig();
    const eventKeywords = config.keywords.legitimateEvents || [];
    const allContent = (text + ' ' + subject).toLowerCase();
    
    // Conta quante parole chiave di eventi sono presenti
    const eventMatches = eventKeywords.filter(keyword => 
      allContent.includes(keyword.toLowerCase())
    ).length;
    
    // Se almeno 3 parole chiave di eventi sono presenti, è probabilmente legittimo
    return eventMatches >= 3;
  }

  private isNewsletterEmail(text: string, parsedData: ParsedEmail): boolean {
    const config = this.configService.getConfig();
    const newsletterKeywords = config.keywords.newsletters || [];
    const allContent = text.toLowerCase();
    
    // Verifica presenza di parole chiave newsletter
    const hasNewsletterKeywords = newsletterKeywords.some(keyword => 
      allContent.includes(keyword.toLowerCase())
    );
    
    // Verifica header specifici di newsletter legittime
    const hasNewsletterHeaders = !!(
      parsedData.headers?.['list-id'] ||
      parsedData.headers?.['list-unsubscribe'] ||
      parsedData.headers?.['list']?.unsubscribe ||
      parsedData.headers?.['x-mailman-version'] ||
      parsedData.headers?.['precedence'] === 'bulk'
    );
    
    return hasNewsletterKeywords && hasNewsletterHeaders;
  }

  private hasProperUnsubscribe(parsedData: ParsedEmail, text: string): boolean {
    // Verifica che ci sia un link di unsubscribe corretto
    const hasUnsubscribeHeader = !!(
      parsedData.headers?.['list-unsubscribe'] ||
      parsedData.headers?.['list-unsubscribe-post'] ||
      parsedData.headers?.['list']?.unsubscribe ||
      parsedData.headers?.['list']?.['unsubscribe-post']
    );
    
    // Verifica la presenza di testo di unsubscribe nel corpo
    const hasUnsubscribeText = /unsubscribe|remove.*list|opt.*out/i.test(text);
    
    return hasUnsubscribeHeader && hasUnsubscribeText;
  }
}
