import { Injectable } from '@nestjs/common';
import { SpamAnalysisResult } from '../utils/types';
import { ParsingService } from '../modules/parsing/parsing.service';
import { TechnicalService } from '../modules/technical/technical.service';
import { NlpService } from '../modules/nlp/nlp.service';
import { ResultService } from '../modules/result/result.service';

@Injectable()
export class PipelineService {
  constructor(
    private readonly parsingService: ParsingService,
    private readonly technicalService: TechnicalService,
    private readonly nlpService: NlpService,
    private readonly resultService: ResultService,
  ) {}

  async runFullPipeline(filename: string): Promise<SpamAnalysisResult> {
    // Step 1: Parsing
    const parsedData = await this.parsingService.parseEmailFile(filename);

    // Step 2: Technical Analysis
    const technicalResult = this.technicalService.analyzeTechnical(parsedData);

    // Step 3: NLP Analysis
    const nlpResult = await this.nlpService.analyzeNlp(parsedData);

    // Step 4: Generate Final Result
    const finalResult = await this.resultService.generateResult(
      technicalResult,
      nlpResult,
    );

    return {
      ...finalResult,
      details: {
        ...finalResult.details,
        parsing: parsedData, // Include parsing data in details
      },
    } as SpamAnalysisResult;
  }
}
