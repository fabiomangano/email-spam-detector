import { Injectable } from '@nestjs/common';
import { runFullPipeline } from '../utils/pipeline.util';
import { SpamAnalysisResult } from '../utils/result.util';

@Injectable()
export class PipelineService {
  async runFullPipeline(filename: string): Promise<SpamAnalysisResult> {
    return runFullPipeline(filename);
  }
}
