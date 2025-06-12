import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadController } from './email-upload/upload.controller';
import { ParsingModule } from './modules/parsing/parsing.module';
import { TechnicalModule } from './modules/technical/technical.module';
import { NlpModule } from './modules/nlp/nlp.module';
import { BehaviorController } from './modules/behavior/behavior.controller';
import { PipelineProcessor } from './pipeline/pipeline.processor/pipeline.processor';
import { PipelineService } from './pipeline/pipeline.service';
import { PipelineController } from './pipeline/pipeline.controller';
import { ConfigModule } from './config/config.module';
import { LlmModule } from './modules/llm/llm.module';
import { ResultModule } from './modules/result/result.module';
import { ResultController } from './modules/result/result.controller';
import { ResultService } from './modules/result/result.service';
import { ResultService } from './modules/result/result.service';
import { BehaviorModule } from './modules/behavior/behavior.module';
import { BehaviorController } from './modules/behavior/behavior.controller';

@Module({
  imports: [ParsingModule, TechnicalModule, NlpModule, BehaviorModule, ResultModule, LlmModule, ConfigModule],
  controllers: [AppController, UploadController, BehaviorController, ResultController, PipelineController],
  providers: [AppService, ResultService, PipelineService, PipelineProcessor],
})
export class AppModule {}
