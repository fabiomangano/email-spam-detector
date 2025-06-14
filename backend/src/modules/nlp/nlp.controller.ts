import { Controller, Get, Param, Res } from '@nestjs/common';
import { NlpService } from './nlp.service';
import { Response } from 'express';

@Controller('nlp')
export class NlpController {
  constructor(private readonly nlpService: NlpService) {}

  @Get(':filename')
  async analyzeNlp(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const result = await this.nlpService.analyzeNlp({});
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }
}
