import { Module } from '@nestjs/common';
import { BehaviorService } from './behavior.service';

@Module({
  providers: [BehaviorService]
})
export class BehaviorModule {}
