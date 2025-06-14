import { Injectable } from '@nestjs/common';
import { trainModel, TrainingResult } from '../utils/model-training.util';

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
      const result: TrainingResult = await trainModel();
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
}