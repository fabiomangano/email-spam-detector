import * as path from 'path';
import { BayesClassifier } from 'natural';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const SPAM_PATH = path.join(__dirname, '../../data/spamassassin/spam');
const HAM_PATH = path.join(__dirname, '../../data/spamassassin/ham');
const MODEL_PATH = path.join(__dirname, '../../model/classifier.json');

export interface TrainingResult {
  success: boolean;
  message: string;
  stats?: {
    spamEmails: number;
    hamEmails: number;
    modelPath: string;
  };
  error?: string;
}

// Leggi i file di una directory
function readEmailsFromDirectory(directory: string): string[] {
  if (!existsSync(directory)) {
    throw new Error(`Directory not found: ${directory}`);
  }
  return readdirSync(directory).map((file) =>
    readFileSync(join(directory, file), 'utf8'),
  );
}

export async function trainModel(): Promise<TrainingResult> {
  try {
    console.log('📦 Avvio addestramento modello...');

    // Leggi le email spam e ham
    const spamEmails = readEmailsFromDirectory(SPAM_PATH);
    const hamEmails = readEmailsFromDirectory(HAM_PATH);

    console.log('📂 Spam emails trovate:', spamEmails.length);
    console.log('📂 Ham emails trovate:', hamEmails.length);

    if (spamEmails.length === 0 || hamEmails.length === 0) {
      throw new Error('Insufficient training data: need both spam and ham emails');
    }

    // Inizializza il classificatore
    const classifier = new BayesClassifier();

    // Aggiungi le email al classificatore
    spamEmails.forEach((email) => classifier.addDocument(email, 'spam'));
    hamEmails.forEach((email) => classifier.addDocument(email, 'ham'));

    // Addestra il modello
    console.log('🏋️‍♂️ Addestramento in corso...');
    classifier.train();

    // Salva il modello (wrapped in Promise for async handling)
    console.log('💾 Salvataggio del modello...');
    await new Promise<void>((resolve, reject) => {
      classifier.save(MODEL_PATH, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    console.log('✅ Modello salvato correttamente in:', MODEL_PATH);

    return {
      success: true,
      message: 'Model trained and saved successfully',
      stats: {
        spamEmails: spamEmails.length,
        hamEmails: hamEmails.length,
        modelPath: MODEL_PATH,
      },
    };
  } catch (error) {
    console.error('❌ Errore nell\'addestramento del modello:', error);
    return {
      success: false,
      message: 'Model training failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}