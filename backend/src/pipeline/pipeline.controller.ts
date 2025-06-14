import { Controller, Get, Param, Res } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { Response } from 'express';

@Controller('pipeline')
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Get(':filename')
  async runPipeline(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const result = await this.pipelineService.runFullPipeline(filename);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        error: (error as Error).message,
        pipeline: 'failed',
      });
    }
  }
}
