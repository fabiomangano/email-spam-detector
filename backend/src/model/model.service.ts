import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { BayesClassifier } from 'natural';
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const SPAM_PATH = path.join(__dirname, '../../data/spamassassin/spam');
const HAM_PATH = path.join(__dirname, '../../data/spamassassin/ham');
const MODEL_PATH = path.join(__dirname, '../../model/classifier.json');
const UPLOADS_PATH = path.join(__dirname, '../../uploads');

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

export interface TrainingSession {
  id: string;
  status: 'training' | 'completed' | 'error';
  progress: number;
  message: string;
  error?: string;
  startTime: Date;
  endTime?: Date;
}

@Injectable()
export class ModelService {
  private trainingInProgress = false;
  private trainingSessions: Map<string, TrainingSession> = new Map();

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

  // New methods for enhanced training API
  async startTrainingWithFiles(spamFile?: Express.Multer.File, hamFile?: Express.Multer.File): Promise<{ training_id: string }> {
    const trainingId = uuidv4();
    
    // Create training session
    const session: TrainingSession = {
      id: trainingId,
      status: 'training',
      progress: 0,
      message: 'Starting training process...',
      startTime: new Date(),
    };
    
    this.trainingSessions.set(trainingId, session);
    
    // Start training in background
    this.runEnhancedTraining(trainingId, spamFile, hamFile);
    
    return { training_id: trainingId };
  }

  getTrainingSessionStatus(trainingId: string): TrainingSession | null {
    return this.trainingSessions.get(trainingId) || null;
  }

  private async runEnhancedTraining(trainingId: string, spamFile?: Express.Multer.File, hamFile?: Express.Multer.File): Promise<void> {
    const session = this.trainingSessions.get(trainingId);
    if (!session) return;

    try {
      // Update progress: Preparing data
      session.progress = 10;
      session.message = 'Preparing training data...';

      // Handle file uploads if provided
      let spamPath = SPAM_PATH;
      let hamPath = HAM_PATH;

      if (spamFile || hamFile) {
        // Ensure uploads directory exists
        if (!existsSync(UPLOADS_PATH)) {
          mkdirSync(UPLOADS_PATH, { recursive: true });
        }

        if (spamFile) {
          const spamUploadPath = join(UPLOADS_PATH, `spam_${trainingId}`);
          await this.extractZipFile(spamFile, spamUploadPath);
          spamPath = spamUploadPath;
        }

        if (hamFile) {
          const hamUploadPath = join(UPLOADS_PATH, `ham_${trainingId}`);
          await this.extractZipFile(hamFile, hamUploadPath);
          hamPath = hamUploadPath;
        }
      }

      // Update progress: Reading emails
      session.progress = 30;
      session.message = 'Reading email data...';

      const spamEmails = this.readEmailsFromDirectory(spamPath);
      const hamEmails = this.readEmailsFromDirectory(hamPath);

      // Update progress: Training model
      session.progress = 50;
      session.message = 'Training model...';

      // Train the model
      const result = await this.trainModelWithData(spamEmails, hamEmails, session);

      if (result.success) {
        session.status = 'completed';
        session.progress = 100;
        session.message = 'Model training completed successfully!';
        session.endTime = new Date();
      } else {
        session.status = 'error';
        session.message = result.message;
        session.error = result.error;
        session.endTime = new Date();
      }

    } catch (error) {
      session.status = 'error';
      session.message = 'Training failed';
      session.error = error instanceof Error ? error.message : 'Unknown error';
      session.endTime = new Date();
    }
  }

  private async extractZipFile(file: Express.Multer.File, extractPath: string): Promise<void> {
    // For now, just save the file - you can implement ZIP extraction here
    // This is a placeholder that assumes the file is already processed
    if (!existsSync(extractPath)) {
      mkdirSync(extractPath, { recursive: true });
    }
    
    // Save the uploaded file
    const filePath = join(extractPath, file.originalname);
    writeFileSync(filePath, file.buffer);
    
    // TODO: Implement actual ZIP extraction using a library like 'adm-zip'
    console.log(`File saved to: ${filePath}`);
  }

  private async trainModelWithData(spamEmails: string[], hamEmails: string[], session: TrainingSession): Promise<TrainingResult> {
    try {
      console.log('📦 Starting enhanced model training...');

      // Update progress
      session.progress = 60;
      session.message = 'Initializing classifier...';

      if (spamEmails.length === 0 || hamEmails.length === 0) {
        throw new Error('Insufficient training data: need both spam and ham emails');
      }

      // Initialize classifier
      const classifier = new BayesClassifier();

      // Update progress
      session.progress = 70;
      session.message = 'Adding training data...';

      // Add emails to classifier
      spamEmails.forEach((email) => classifier.addDocument(email, 'spam'));
      hamEmails.forEach((email) => classifier.addDocument(email, 'ham'));

      // Update progress
      session.progress = 80;
      session.message = 'Training classifier...';

      // Train the model
      console.log('🏋️‍♂️ Training in progress...');
      classifier.train();

      // Update progress
      session.progress = 90;
      session.message = 'Saving model...';

      // Save the model
      console.log('💾 Saving model...');
      await new Promise<void>((resolve, reject) => {
        classifier.save(MODEL_PATH, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      console.log('✅ Enhanced model saved successfully to:', MODEL_PATH);

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
      console.error('❌ Error in enhanced model training:', error);
      return {
        success: false,
        message: 'Model training failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
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