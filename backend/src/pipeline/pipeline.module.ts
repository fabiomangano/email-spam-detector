import { Module } from '@nestjs/common';
import { PipelineController } from './pipeline.controller';
import { PipelineService } from './pipeline.service';
import { ParsingModule } from '../modules/parsing/parsing.module';
import { TechnicalModule } from '../modules/technical/technical.module';
import { BehaviorModule } from '../modules/behavior/behavior.module';
import { NlpModule } from '../modules/nlp/nlp.module';
import { ResultModule } from '../modules/result/result.module';

@Module({
  imports: [
    ParsingModule,
    TechnicalModule,
    BehaviorModule,
    NlpModule,
    ResultModule,
  ],
  controllers: [PipelineController],
  providers: [PipelineService],
  exports: [PipelineService],
})
export class PipelineModule {}
