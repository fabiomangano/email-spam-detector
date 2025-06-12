import { Test, TestingModule } from '@nestjs/testing';
import { BehaviorController } from './behavior.controller';

describe('BehaviorController', () => {
  let controller: BehaviorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BehaviorController],
    }).compile();

    controller = module.get<BehaviorController>(BehaviorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
