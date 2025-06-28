import { Injectable } from '@nestjs/common';
import { NlpAnalysisResult } from '../../utils/types';
import { STOPWORDS, MODEL_PATH } from '../../utils/constants';
import { ConfigService } from '../config/config.service';
import * as fs from 'fs';
import * as path from 'path';
import { TfIdf, PorterStemmer, WordTokenizer, BayesClassifier } from 'natural';

@Injectable()
export class NlpService {
  private readonly tokenizer = new WordTokenizer();
  private readonly tfidf = new TfIdf();
  private classifier: BayesClassifier | null = null;
  private readonly modelPath = path.join(process.cwd(), MODEL_PATH);

  constructor(private readonly configService: ConfigService) {}

  async analyzeNlp(parsedData: any): Promise<NlpAnalysisResult> {
    const plainText = parsedData.plainText || '';
    const htmlText = parsedData.htmlText || '';
    const subject = parsedData.metadata?.subject || '';

    const analysis = await this.classifyEmail(plainText, htmlText, subject);

    // Calculate dynamic sentiment based on text content
    const sentiment = this.calculateSentiment(
      plainText + ' ' + subject,
      analysis.nlpMetrics,
    );

    // Extract keywords using TF-IDF scores
    const keywords = this.extractKeywords(
      analysis.tokens,
      analysis.tfidfVector,
    );

    // Detect language dynamically
    const language = this.detectLanguage(plainText + ' ' + subject);

    // Calculate toxicity score based on content analysis
    const toxicityScore = this.calculateToxicity(
      analysis.nlpMetrics,
      sentiment.score,
    );

    return {
      tokens: analysis.tokens,
      tfidfVector: analysis.tfidfVector,
      nlpMetrics: analysis.nlpMetrics,
      prediction: analysis.prediction,
      sentiment,
      keywords,
      topics: this.extractTopics(analysis.prediction, keywords),
      language,
      toxicity: {
        score: toxicityScore,
        categories: this.getToxicityCategories(
          toxicityScore,
          analysis.nlpMetrics,
        ),
      },
    };
  }

  private async classifyEmail(
    plainText: string,
    htmlText: string,
    subject: string,
  ): Promise<any> {
    const emailText = `${subject} ${plainText} ${htmlText}`;

    // Preprocessing
    const tokens = this.preprocessText(emailText);

    // NLP Metrics
    const nlpMetrics = this.calculateNlpMetrics(emailText);

    // TF-IDF Calculation - use fresh instance to avoid corpus pollution
    const localTfidf = new TfIdf();
    localTfidf.addDocument(emailText);
    const tfidfVector = this.calculateTfIdfWithInstance(tokens, localTfidf);

    // Classification
    const prediction = this.classifyText(emailText);

    return {
      tokens,
      tfidfVector,
      nlpMetrics,
      prediction,
    };
  }

  private preprocessText(text: string): string[] {
    const cleaned = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    let tokens = this.tokenizer.tokenize(cleaned);
    tokens = tokens.filter((token) => !STOPWORDS.includes(token));
    tokens = tokens.map((token) => PorterStemmer.stem(token));
    return tokens;
  }

  private calculateNlpMetrics(text: string): any {
    const config = this.configService.getConfig();
    const spamWords = config.keywords.spam;
    const tokens = this.preprocessText(text);

    const numSpammyWords = tokens.filter((token) =>
      spamWords.includes(token.toLowerCase()),
    ).length;
    const spamWordRatio = numSpammyWords / (tokens.length || 1);
    const allCapsCount = (text.match(/[A-Z]{3,}/g) || []).length;
    const exclamationCount = (text.match(/!/g) || []).length;

    return {
      numSpammyWords,
      spamWordRatio,
      allCapsCount,
      exclamationCount,
      tokens,
    };
  }

  private calculateTfIdf(tokens: string[]): number[] {
    const vector: number[] = [];
    tokens.forEach((token, index) => {
      const score = this.tfidf.tfidf(token, 0); // 0: Documento corrente
      vector[index] = score || 0;
    });
    return vector;
  }

  private calculateTfIdfWithInstance(
    tokens: string[],
    tfidfInstance: TfIdf,
  ): number[] {
    const vector: number[] = [];
    tokens.forEach((token, index) => {
      const score = tfidfInstance.tfidf(token, 0); // 0: Documento corrente
      vector[index] = score || 0;
    });
    return vector;
  }

  private classifyText(text: string): string {
    if (!this.classifier) {
      console.warn('⚠️ Modello non caricato. Caricamento in corso...');
      this.loadModel();
    }

    if (!this.classifier) {
      console.error('❌ Modello non disponibile.');
      return 'unknown';
    }

    return this.classifier.classify(text);
  }

  private loadModel(): void {
    console.log('📦 Caricamento del modello...');
    try {
      const modelData = fs.readFileSync(this.modelPath, 'utf8');
      this.classifier = BayesClassifier.restore(JSON.parse(modelData));
      console.log('✅ Modello caricato correttamente.');
    } catch (err) {
      console.error('❌ Errore durante il caricamento del modello:', err);
    }
  }

  private calculateSentiment(
    text: string,
    nlpMetrics: any,
  ): { score: number; label: string } {
    // Basic sentiment calculation based on content indicators
    let sentimentScore = 0;

    // Negative indicators
    const negativeWords = [
      'bad',
      'terrible',
      'awful',
      'hate',
      'worst',
      'horrible',
      'disgusting',
      'fraud',
      'scam',
      'fake',
    ];
    const positiveWords = [
      'good',
      'great',
      'excellent',
      'amazing',
      'wonderful',
      'fantastic',
      'love',
      'best',
      'awesome',
      'perfect',
    ];

    const words = text.toLowerCase().split(/\s+/);

    // Count positive and negative words
    const negativeCount = words.filter((word) =>
      negativeWords.some((neg) => word.includes(neg)),
    ).length;
    const positiveCount = words.filter((word) =>
      positiveWords.some((pos) => word.includes(pos)),
    ).length;

    // Calculate base sentiment
    sentimentScore =
      (positiveCount - negativeCount) / Math.max(words.length / 10, 1);

    // Adjust based on spam indicators
    if (nlpMetrics.spamWordRatio > 0.1) {
      sentimentScore -= 0.3; // Spam content tends to be more negative/aggressive
    }

    if (nlpMetrics.allCapsCount > 2) {
      sentimentScore -= 0.2; // ALL CAPS is often aggressive
    }

    if (nlpMetrics.exclamationCount > 3) {
      sentimentScore -= 0.1; // Too many exclamations can be negative
    }

    // Normalize score between -1 and 1
    sentimentScore = Math.max(-1, Math.min(1, sentimentScore));

    // Determine label
    let label = 'neutral';
    if (sentimentScore > 0.1) label = 'positive';
    else if (sentimentScore < -0.1) label = 'negative';

    return { score: sentimentScore, label };
  }

  private extractKeywords(tokens: string[], tfidfVector: number[]): string[] {
    // Count token frequencies
    const tokenFrequency = new Map<string, number>();
    tokens.forEach((token) => {
      if (token.length > 2) {
        // Filter short tokens immediately
        tokenFrequency.set(token, (tokenFrequency.get(token) || 0) + 1);
      }
    });

    // Create array of unique tokens with frequencies
    const tokenArray = Array.from(tokenFrequency.entries())
      .map(([token, frequency]) => ({ token, frequency }))
      .sort((a, b) => b.frequency - a.frequency); // Sort by frequency descending

    // Return top 10 unique keywords
    return tokenArray.slice(0, 10).map((item) => item.token);
  }

  private detectLanguage(text: string): {
    detected: string;
    confidence: number;
  } {
    // Simple language detection based on character patterns and common words
    const englishWords = [
      'the',
      'and',
      'of',
      'to',
      'a',
      'in',
      'is',
      'it',
      'you',
      'that',
      'he',
      'was',
      'for',
      'on',
      'are',
      'as',
      'with',
      'his',
      'they',
      'be',
    ];
    const italianWords = [
      'il',
      'di',
      'e',
      'la',
      'che',
      'per',
      'un',
      'in',
      'con',
      'del',
      'da',
      'al',
      'le',
      'si',
      'dei',
      'delle',
      'gli',
      'alle',
      'questa',
      'anche',
    ];
    const spanishWords = [
      'el',
      'de',
      'y',
      'la',
      'que',
      'en',
      'un',
      'es',
      'se',
      'no',
      'te',
      'lo',
      'le',
      'da',
      'su',
      'por',
      'son',
      'con',
      'para',
      'al',
    ];
    const frenchWords = [
      'le',
      'de',
      'et',
      'un',
      'il',
      'être',
      'et',
      'en',
      'avoir',
      'que',
      'pour',
      'dans',
      'ce',
      'son',
      'une',
      'sur',
      'avec',
      'ne',
      'se',
      'pas',
    ];

    const words = text.toLowerCase().split(/\s+/);

    const englishMatches = words.filter((word) =>
      englishWords.includes(word),
    ).length;
    const italianMatches = words.filter((word) =>
      italianWords.includes(word),
    ).length;
    const spanishMatches = words.filter((word) =>
      spanishWords.includes(word),
    ).length;
    const frenchMatches = words.filter((word) =>
      frenchWords.includes(word),
    ).length;

    const totalWords = words.length;

    // Calculate confidence scores
    const scores = {
      en: englishMatches / totalWords,
      it: italianMatches / totalWords,
      es: spanishMatches / totalWords,
      fr: frenchMatches / totalWords,
    };

    // Find language with highest score
    const detected = Object.entries(scores).reduce((a, b) =>
      scores[a[0]] > scores[b[0]] ? a : b,
    )[0];
    const confidence = Math.min(0.95, Math.max(0.1, scores[detected] * 3)); // Scale confidence

    return { detected, confidence };
  }

  private extractTopics(prediction: string, keywords: string[]): string[] {
    const topics = [prediction === 'spam' ? 'spam' : 'legitimate'];

    // Add topic based on keywords
    const topicKeywords = {
      finance: [
        'money',
        'cash',
        'loan',
        'credit',
        'invest',
        'bank',
        'payment',
        'financial',
      ],
      health: [
        'weight',
        'diet',
        'supplement',
        'medic',
        'health',
        'cure',
        'treatment',
      ],
      technology: [
        'computer',
        'software',
        'tech',
        'internet',
        'digital',
        'online',
        'website',
      ],
      marketing: [
        'offer',
        'deal',
        'sale',
        'discount',
        'promo',
        'advertis',
        'market',
      ],
      social: ['friend', 'social', 'community', 'share', 'connect', 'network'],
    };

    for (const [topic, topicWords] of Object.entries(topicKeywords)) {
      if (
        keywords.some((keyword) =>
          topicWords.some((topicWord) => keyword.includes(topicWord)),
        )
      ) {
        topics.push(topic);
      }
    }

    return topics.slice(0, 3); // Limit to 3 topics
  }

  private calculateToxicity(nlpMetrics: any, sentimentScore: number): number {
    let toxicity = 0;

    // Base toxicity from spam word ratio
    toxicity += nlpMetrics.spamWordRatio * 0.4;

    // Add toxicity from negative sentiment
    if (sentimentScore < 0) {
      toxicity += Math.abs(sentimentScore) * 0.3;
    }

    // Add toxicity from excessive caps and exclamations
    toxicity += Math.min(0.2, nlpMetrics.allCapsCount * 0.05);
    toxicity += Math.min(0.1, nlpMetrics.exclamationCount * 0.02);

    // Normalize between 0 and 1
    return Math.max(0, Math.min(1, toxicity));
  }

  private getToxicityCategories(
    toxicityScore: number,
    nlpMetrics: any,
  ): string[] {
    const categories: string[] = [];

    if (toxicityScore > 0.7) {
      categories.push('high-toxicity');
    }

    if (nlpMetrics.spamWordRatio > 0.15) {
      categories.push('spam-content');
    }

    if (nlpMetrics.allCapsCount > 3) {
      categories.push('aggressive-language');
    }

    if (nlpMetrics.exclamationCount > 5) {
      categories.push('excessive-punctuation');
    }

    return categories;
  }
}
