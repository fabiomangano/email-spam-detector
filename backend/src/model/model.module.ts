import { Module } from '@nestjs/common';
import { ModelController, TrainModelController } from './model.controller';
import { ModelService } from './model.service';

@Module({
  controllers: [ModelController, TrainModelController],
  providers: [ModelService],
  exports: [ModelService],
})
export class ModelModule {}
