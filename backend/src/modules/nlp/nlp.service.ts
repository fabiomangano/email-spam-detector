import { Injectable } from '@nestjs/common';
import { NlpAnalysisResult } from '../../utils/types';
import { STOPWORDS, SPAM_WORDS, MODEL_PATH } from '../../utils/constants';
import * as fs from 'fs';
import * as path from 'path';
import { TfIdf, PorterStemmer, WordTokenizer, BayesClassifier } from 'natural';

@Injectable()
export class NlpService {
  private readonly tokenizer = new WordTokenizer();
  private readonly tfidf = new TfIdf();
  private classifier: BayesClassifier | null = null;
  private readonly modelPath = path.join(process.cwd(), MODEL_PATH);

  async analyzeNlp(parsedData: any): Promise<NlpAnalysisResult> {
    const plainText = parsedData.parsed?.plainText || '';
    const htmlText = parsedData.parsed?.htmlText || '';
    const subject = parsedData.parsed?.metadata?.subject || '';

    const analysis = await this.classifyEmail(plainText, htmlText, subject);
    
    // Calculate toxicity score based on spam prediction and metrics
    const toxicityScore = analysis.prediction === 'spam' ? 
      Math.min(0.8, 0.3 + analysis.nlpMetrics.spamWordRatio * 0.5) : 
      Math.min(0.3, analysis.nlpMetrics.spamWordRatio * 0.3);

    return {
      tokens: analysis.tokens,
      tfidfVector: analysis.tfidfVector,
      nlpMetrics: analysis.nlpMetrics,
      prediction: analysis.prediction,
      sentiment: {
        score: analysis.prediction === 'spam' ? -0.5 : 0.1,
        label: analysis.prediction === 'spam' ? 'negative' : 'neutral',
      },
      keywords: analysis.tokens.slice(0, 10), // Top 10 tokens as keywords
      topics: [analysis.prediction === 'spam' ? 'spam' : 'legitimate'],
      language: {
        detected: 'en',
        confidence: 0.85,
      },
      toxicity: {
        score: toxicityScore,
        categories: analysis.prediction === 'spam' ? ['spam'] : [],
      },
    };
  }

  private async classifyEmail(plainText: string, htmlText: string, subject: string): Promise<any> {
    const emailText = `${subject} ${plainText} ${htmlText}`;

    // Preprocessing
    const tokens = this.preprocessText(emailText);

    // NLP Metrics
    const nlpMetrics = this.calculateNlpMetrics(emailText);

    // TF-IDF Calculation
    this.tfidf.addDocument(emailText); // Aggiungi il documento
    const tfidfVector = this.calculateTfIdf(tokens);

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
    const tokens = this.preprocessText(text);

    const numSpammyWords = tokens.filter((token) => SPAM_WORDS.includes(token)).length;
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
}
