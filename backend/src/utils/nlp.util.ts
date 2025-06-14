import * as fs from 'fs';
import * as path from 'path';
import { TfIdf, PorterStemmer, WordTokenizer, BayesClassifier } from 'natural';

const MODEL_PATH = path.join(__dirname, '../../model/classifier.json');

// Stopwords
const stopwords = [
  'a', 'an', 'the', 'and', 'or', 'but', 'because', 'so', 'of', 'in', 'on', 
  'at', 'by', 'with', 'for', 'about', 'against', 'between', 'into', 'through', 
  'during', 'before', 'after', 'above', 'below'
];

// Spammy Words
const spamWords = [
  'free', 'win', 'offer', 'click', 'cash', 'prize', 'urgent', 'act now', 'buy now'
];

const tokenizer = new WordTokenizer();
const tfidf = new TfIdf();
let classifier: BayesClassifier | null = null;

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

/**
 * Carica il modello Bayesiano salvato
 */
function loadModel(): void {
  console.log('📦 Caricamento del modello...');
  try {
    const modelData = fs.readFileSync(MODEL_PATH, 'utf8');
    classifier = BayesClassifier.restore(JSON.parse(modelData));
    console.log('✅ Modello caricato correttamente.');
  } catch (err) {
    console.error('❌ Errore durante il caricamento del modello:', err);
  }
}

/**
 * Preprocessing del testo
 */
export function preprocessText(text: string): string[] {
  const cleaned = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  let tokens = tokenizer.tokenize(cleaned);
  tokens = tokens.filter((token) => !stopwords.includes(token));
  tokens = tokens.map((token) => PorterStemmer.stem(token));
  return tokens;
}

/**
 * Calcola le metriche NLP
 */
export function calculateNlpMetrics(text: string): Record<string, any> {
  const tokens = preprocessText(text);

  const numSpammyWords = tokens.filter((token) => spamWords.includes(token)).length;
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

/**
 * Calcola il vettore TF-IDF
 */
export function calculateTfIdf(tokens: string[]): number[] {
  const vector: number[] = [];
  tokens.forEach((token, index) => {
    const score = tfidf.tfidf(token, 0); // 0: Documento corrente
    vector[index] = score || 0;
  });
  return vector;
}

/**
 * Classifica il testo utilizzando il modello Bayesiano
 */
export function classifyText(text: string): string {
  if (!classifier) {
    console.warn('⚠️ Modello non caricato. Caricamento in corso...');
    loadModel();
  }
  
  if (!classifier) {
    console.error('❌ Modello non disponibile.');
    return 'unknown';
  }

  return classifier.classify(text);
}

/**
 * Esegui il modulo NLP completo
 */
export function classifyEmail(plainText: string, htmlText: string, subject: string): Record<string, any> {
  const emailText = `${subject} ${plainText} ${htmlText}`;

  // Preprocessing
  const tokens = preprocessText(emailText);

  // NLP Metrics
  const nlpMetrics = calculateNlpMetrics(emailText);

  // TF-IDF Calculation
  tfidf.addDocument(emailText); // Aggiungi il documento
  const tfidfVector = calculateTfIdf(tokens);

  // Classification
  const prediction = classifyText(emailText);

  return {
    tokens,
    tfidfVector,
    nlpMetrics,
    prediction,
  };
}

export function analyzeNlp(parsedData: any): Promise<NlpAnalysisResult> {
  const plainText = parsedData.parsed?.text || '';
  const htmlText = parsedData.parsed?.html || '';
  const subject = parsedData.parsed?.subject || '';

  const analysis = classifyEmail(plainText, htmlText, subject);
  
  // Calculate toxicity score based on spam prediction and metrics
  const toxicityScore = analysis.prediction === 'spam' ? 
    Math.min(0.8, 0.3 + analysis.nlpMetrics.spamWordRatio * 0.5) : 
    Math.min(0.3, analysis.nlpMetrics.spamWordRatio * 0.3);

  return Promise.resolve({
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
  });
}