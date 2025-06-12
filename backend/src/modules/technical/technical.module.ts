import { Module } from '@nestjs/common';
import { TechnicalController } from './technical.controller';
import { TechnicalService } from './technical.service';

@Module({
  controllers: [TechnicalController],
  providers: [TechnicalService],
})
export class TechnicalModule {}
