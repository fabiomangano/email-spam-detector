import { Controller, Get, Param, Res } from '@nestjs/common';
import { TechnicalService } from './technical.service';
import { Response } from 'express';

@Controller('technical')
export class TechnicalController {
  constructor(private readonly technicalService: TechnicalService) {}

  @Get(':filename')
  async analyzeTechnical(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      // Per ora assumiamo che i dati parsati vengano passati,
      // ma in un caso reale dovremmo prima fare il parsing
      const result = await this.technicalService.analyzeTechnical({});
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }
}
