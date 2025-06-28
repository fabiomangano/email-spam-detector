import { Controller, Post, Body } from '@nestjs/common';
import { FeedbackService } from './feedback.service';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  async submitFeedback(@Body() body: { filename: string; isSpam: boolean }) {
    const { filename, isSpam } = body;
    return await this.feedbackService.moveFeedbackFile(filename, isSpam);
  }
}
