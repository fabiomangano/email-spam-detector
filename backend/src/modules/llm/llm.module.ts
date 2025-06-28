import { Module } from '@nestjs/common';
import { LLMService } from './llm.service';
import { LLMController } from './llm.controller';
import { ConfigModule } from '../config/config.module';
import { ParsingModule } from '../parsing/parsing.module';

@Module({
  imports: [ConfigModule, ParsingModule],
  controllers: [LLMController],
  providers: [LLMService],
  exports: [LLMService],
})
export class LLMModule {}
