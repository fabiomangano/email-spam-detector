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
    console.log(`Starting full pipeline for file: ${filename}`);

    try {
      // Step 1: Parsing
      console.log('Step 1: Parsing email...');
      const parsedData = await this.parsingService.parseEmailFile(filename);

      console.log("qui", parsedData)

      // Step 2: Technical Analysis
      console.log('Step 2: Running technical analysis...');
      const technicalResult =
        await this.technicalService.analyzeTechnical(parsedData);

      // Step 3: Behavior Analysis
      console.log('Step 3: Running behavior analysis...');
      const behaviorResult =
        await this.behaviorService.analyzeBehavior(parsedData);

      // Step 4: NLP Analysis
      console.log('Step 4: Running NLP analysis...');
      const nlpResult = await this.nlpService.analyzeNlp(parsedData);

      // Step 5: Generate Final Result
      console.log('Step 5: Generating final result...');
      const finalResult = await this.resultService.generateResult(
        technicalResult,
        behaviorResult,
        nlpResult,
      );

      console.log('Pipeline completed successfully');
      return {
        ...finalResult,
        details: {
          ...finalResult.details,
          parsing: parsedData, // Include parsing data in details
        },
      } as any;
    } catch (error) {
      console.error('Pipeline failed:', error);
      throw error;
    }
  }
}
