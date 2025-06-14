import { Controller, Post, Get } from '@nestjs/common';
import { ModelService } from './model.service';

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