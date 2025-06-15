import { Injectable } from '@nestjs/common';
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

@Injectable()
export class ModelService {
  private trainingInProgress = false;

  startTraining(): { message: string; status: string } {
    if (this.trainingInProgress) {
      return {
        message: 'Training already in progress',
        status: 'in_progress',
      };
    }

    this.trainingInProgress = true;

    // Start training in background without awaiting
    void this.runTrainingInBackground();

    return {
      message: 'Model training started in background',
      status: 'started',
    };
  }

  private async runTrainingInBackground(): Promise<void> {
    try {
      const result: TrainingResult = await this.trainModel();
      console.log('Training completed:', result);
    } catch (error) {
      console.error('Training failed:', error);
    } finally {
      this.trainingInProgress = false;
    }
  }

  getTrainingStatus(): { inProgress: boolean } {
    return { inProgress: this.trainingInProgress };
  }

  // Training logic moved from utils
  private readEmailsFromDirectory(directory: string): string[] {
    if (!existsSync(directory)) {
      throw new Error(`Directory not found: ${directory}`);
    }
    return readdirSync(directory).map((file) =>
      readFileSync(join(directory, file), 'utf8'),
    );
  }

  private async trainModel(): Promise<TrainingResult> {
    try {
      console.log('📦 Avvio addestramento modello...');

      // Leggi le email spam e ham
      const spamEmails = this.readEmailsFromDirectory(SPAM_PATH);
      const hamEmails = this.readEmailsFromDirectory(HAM_PATH);

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
}