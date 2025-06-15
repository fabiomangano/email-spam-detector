import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadController } from './email-upload/upload.controller';
import { ParsingModule } from './modules/parsing/parsing.module';
import { TechnicalModule } from './modules/technical/technical.module';
import { NlpModule } from './modules/nlp/nlp.module';
import { ResultModule } from './modules/result/result.module';
import { ConfigModule } from './config/config.module';
import { PipelineModule } from './pipeline/pipeline.module';
import { ModelModule } from './model/model.module';

@Module({
  imports: [
    ParsingModule,
    TechnicalModule,
    NlpModule,
    ResultModule,
    ConfigModule,
    PipelineModule,
    ModelModule,
  ],
  controllers: [AppController, UploadController],
  providers: [AppService],
})
export class AppModule {}
