import { Test, TestingModule } from '@nestjs/testing';
import { PipelineProcessor } from './pipeline.processor';

describe('PipelineProcessor', () => {
  let provider: PipelineProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PipelineProcessor],
    }).compile();

    provider = module.get<PipelineProcessor>(PipelineProcessor);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
