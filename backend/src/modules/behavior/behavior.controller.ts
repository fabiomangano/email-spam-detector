import { Controller, Get, Param, Res } from '@nestjs/common';
import { BehaviorService } from './behavior.service';
import { Response } from 'express';

@Controller('behavior')
export class BehaviorController {
  constructor(private readonly behaviorService: BehaviorService) {}

  @Get(':filename')
  async analyzeBehavior(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.behaviorService.analyzeBehavior({});
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }
}
