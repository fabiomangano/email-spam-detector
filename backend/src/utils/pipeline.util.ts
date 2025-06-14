import { parseEmailFile } from './parsing.util';
import { analyzeTechnical } from './technical.util';
import { analyzeBehavior } from './behavior.util';
import { analyzeNlp } from './nlp.util';
import { generateResult, SpamAnalysisResult } from './result.util';

export async function runFullPipeline(filename: string): Promise<SpamAnalysisResult> {
  // Step 1: Parsing
  const parsedData = await parseEmailFile(filename);

  // Step 2: Technical Analysis
  const technicalResult = await analyzeTechnical(parsedData);

  // Step 3: Behavior Analysis
  const behaviorResult = await analyzeBehavior(parsedData);

  // Step 4: NLP Analysis
  const nlpResult = await analyzeNlp(parsedData);

  // Step 5: Generate Final Result
  const finalResult = await generateResult(
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