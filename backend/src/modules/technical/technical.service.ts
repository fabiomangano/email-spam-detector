import { Injectable } from '@nestjs/common';
import {
  computeEmailMetrics,
  EmailTechnicalMetrics,
} from '../../utils/email-metrics';

@Injectable()
export class TechnicalService {
  analyzeTechnical(parsedData: any): Promise<EmailTechnicalMetrics> {
    const metrics = computeEmailMetrics(parsedData);
    return Promise.resolve(metrics);
  }
}
