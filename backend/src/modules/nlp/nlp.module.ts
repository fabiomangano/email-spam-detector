import { Module } from '@nestjs/common';
import { NlpService } from './nlp.service';
import { NlpController } from './nlp.controller';

@Module({
  providers: [NlpService],
  controllers: [NlpController]
})
export class NlpModule {}
