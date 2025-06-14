import { Injectable } from '@nestjs/common';
import { ParsingService } from '../modules/parsing/parsing.service';
import { TechnicalService } from '../modules/technical/technical.service';
import { BehaviorService } from '../modules/behavior/behavior.service';
import { NlpService } from '../modules/nlp/nlp.service';
import {
  ResultService,
  SpamAnalysisResult,
} from '../modules/result/result.service';

@Injectable()
export class PipelineService {
  constructor(
    private readonly parsingService: ParsingService,
    private readonly technicalService: TechnicalService,
    private readonly behaviorService: BehaviorService,
    private readonly nlpService: NlpService,
    private readonly resultService: ResultService,
  ) {}

  async runFullPipeline(filename: string): Promise<SpamAnalysisResult> {
    // Step 1: Parsing
    const parsedData = await this.parsingService.parseEmailFile(filename);

    // Step 2: Technical Analysis
    const technicalResult =
      await this.technicalService.analyzeTechnical(parsedData);

    // Step 3: Behavior Analysis
    const behaviorResult =
      await this.behaviorService.analyzeBehavior(parsedData);

    // Step 4: NLP Analysis
    const nlpResult = await this.nlpService.analyzeNlp(parsedData);

    // Step 5: Generate Final Result
    const finalResult = await this.resultService.generateResult(
      technicalResult,
      behaviorResult,
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
