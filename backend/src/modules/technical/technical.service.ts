import { Injectable } from '@nestjs/common';
import { analyzeTechnical } from '../../utils/technical.util';
import { EmailTechnicalMetrics } from '../../utils/email-metrics';

@Injectable()
export class TechnicalService {
  analyzeTechnical(parsedData: any): Promise<EmailTechnicalMetrics> {
    return analyzeTechnical(parsedData);
  }
}
