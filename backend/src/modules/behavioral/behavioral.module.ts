import { Module } from '@nestjs/common';
import { BehavioralService } from './behavioral.service';

@Module({
  providers: [BehavioralService],
  exports: [BehavioralService],
})
export class BehavioralModule {}