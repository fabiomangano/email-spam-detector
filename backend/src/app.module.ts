import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadController } from './email-upload/upload.controller';
import { ParsingModule } from './modules/parsing/parsing.module';
import { TechnicalModule } from './modules/technical/technical.module';
import { NlpModule } from './modules/nlp/nlp.module';
import { BehaviorModule } from './modules/behavior/behavior.module';
import { ResultModule } from './modules/result/result.module';
import { LlmModule } from './modules/llm/llm.module';
import { ConfigModule } from './config/config.module';
import { PipelineModule } from './pipeline/pipeline.module';

@Module({
  imports: [
    ParsingModule,
    TechnicalModule,
    NlpModule,
    BehaviorModule,
    ResultModule,
    LlmModule,
    ConfigModule,
    PipelineModule,
  ],
  controllers: [
    AppController,
    UploadController,
  ],
  providers: [AppService],
})
export class AppModule {}
