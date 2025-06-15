import { Controller, Post, Body, Res } from '@nestjs/common';
import { TechnicalService } from './technical.service';
import { Response } from 'express';
import { ParsedEmail } from '../../utils/types';

@Controller('technical')
export class TechnicalController {
  constructor(private readonly technicalService: TechnicalService) {}

  @Post('analyze')
  analyzeTechnical(
    @Body() parsedEmail: ParsedEmail,
    @Res() res: Response,
  ) {
    try {
      const result = this.technicalService.analyzeTechnical(parsedEmail);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }
}
