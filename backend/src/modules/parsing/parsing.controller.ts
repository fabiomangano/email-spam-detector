import { Controller, Get, Param, Res } from '@nestjs/common';
import { ParsingService } from './parsing.service';
import { Response } from 'express';

@Controller('parse')
export class ParsingController {
  constructor(private readonly parsingService: ParsingService) {}

  @Get(':filename')
  async parse(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const result = await this.parsingService.parseEmailFile(filename);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }
}
