import {
  computeEmailMetrics,
  EmailTechnicalMetrics,
} from './email-metrics';

export function analyzeTechnical(parsedData: any): Promise<EmailTechnicalMetrics> {
  const metrics = computeEmailMetrics(parsedData);
  return Promise.resolve(metrics);
}