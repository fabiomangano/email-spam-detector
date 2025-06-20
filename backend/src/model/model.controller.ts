import { Controller, Post, Get, Param, UseInterceptors, UploadedFiles, HttpException, HttpStatus } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ModelService, TrainingSession } from './model.service';

@Controller('model')
export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  @Post('train')
  trainModel(): { message: string; status: string } {
    return this.modelService.startTraining();
  }

  @Get('status')
  getTrainingStatus(): { inProgress: boolean } {
    return this.modelService.getTrainingStatus();
  }
}

// New controller for the frontend-expected endpoints
@Controller('train-model')
export class TrainModelController {
  constructor(private readonly modelService: ModelService) {}

  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'spam_file', maxCount: 1 },
    { name: 'ham_file', maxCount: 1 },
  ]))
  async startTraining(
    @UploadedFiles() files: { spam_file?: Express.Multer.File[], ham_file?: Express.Multer.File[] }
  ): Promise<{ training_id: string }> {
    try {
      const spamFile = files.spam_file?.[0];
      const hamFile = files.ham_file?.[0];
      
      return await this.modelService.startTrainingWithFiles(spamFile, hamFile);
    } catch (error) {
      throw new HttpException(
        'Failed to start training',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('status/:trainingId')
  getTrainingSessionStatus(@Param('trainingId') trainingId: string): TrainingSession {
    const session = this.modelService.getTrainingSessionStatus(trainingId);
    
    if (!session) {
      throw new HttpException(
        'Training session not found',
        HttpStatus.NOT_FOUND
      );
    }
    
    return session;
  }
}