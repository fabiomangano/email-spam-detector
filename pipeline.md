## PARSING

````typescript

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
````

headers
plainText
htmlText
attachments
metada

## TECHNICAL

## NLP

## RESULT
