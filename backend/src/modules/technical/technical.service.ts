import { Injectable } from '@nestjs/common';
import { computeEmailMetrics, EmailTechnicalMetrics } from '../../utils/email-metrics';

@Injectable()
export class TechnicalService {
  async analyzeTechnical(parsedData: any): Promise<EmailTechnicalMetrics> {
    const metrics = computeEmailMetrics(parsedData);
    return metrics;
  }
}
