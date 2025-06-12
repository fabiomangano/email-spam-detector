import { Module } from '@nestjs/common';
import { ParsingController } from './parsing.controller';
import { ParsingService } from './parsing.service';

@Module({
  controllers: [ParsingController],
  providers: [ParsingService],
  exports: [ParsingService],
})
export class ParsingModule {}