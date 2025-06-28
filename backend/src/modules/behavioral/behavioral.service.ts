import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

export interface EmailRecord {
  date: string;
  subject: string;
  recipientsCount: number;
  contentHash: string;
  hourOfDay: number;
  dayOfWeek: string;
}

export interface SenderHistory {
  [senderEmail: string]: EmailRecord[];
}

export interface BehavioralAnalysisResult {
  from: string;
  isNewSender: boolean;
  emailCountLast24h: number;
  emailCountLast7d: number;
  burstRatio: number;
  avgRecipients: number;
  hourOfDay: number;
  dayOfWeek: string;
  contentSimilarityRate: number;
  subjectChangeRate: number;
  reputationScore: number;
  firstSeenDate?: string;
  timeAnomalyScore: number;
  massMailingIndicator: boolean;
}

@Injectable()
export class BehavioralService {
  private historyPath = path.join(process.cwd(), 'data', 'sender-history.json');
  private senderHistory: SenderHistory = {};

  constructor() {
    this.loadHistory();
  }

  private loadHistory(): void {
    try {
      const dataDir = path.dirname(this.historyPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(this.historyPath)) {
        const data = fs.readFileSync(this.historyPath, 'utf8');
        this.senderHistory = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading sender history:', error);
      this.senderHistory = {};
    }
  }

  private saveHistory(): void {
    try {
      fs.writeFileSync(this.historyPath, JSON.stringify(this.senderHistory, null, 2));
    } catch (error) {
      console.error('Error saving sender history:', error);
    }
  }

  private generateContentHash(content: string): string {
    return createHash('md5').update(content.toLowerCase().replace(/\s+/g, ' ').trim()).digest('hex').substring(0, 8);
  }

  private getDayOfWeek(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  private calculateBurstRatio(senderEmail: string, currentDate: Date): number {
    const history = this.senderHistory[senderEmail] || [];
    if (history.length < 5) return 1.0;

    // Get emails from last 24 hours
    const last24h = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
    const recentEmails = history.filter(email => new Date(email.date) >= last24h);

    if (recentEmails.length === 0) return 1.0;

    // Calculate hourly distribution
    const hourlyCount: { [hour: number]: number } = {};
    recentEmails.forEach(email => {
      const hour = new Date(email.date).getHours();
      hourlyCount[hour] = (hourlyCount[hour] || 0) + 1;
    });

    const counts = Object.values(hourlyCount);
    const maxCount = Math.max(...counts);
    const avgCount = counts.reduce((sum, count) => sum + count, 0) / counts.length;

    return avgCount > 0 ? maxCount / avgCount : 1.0;
  }

  private calculateContentSimilarity(senderEmail: string, currentContentHash: string): number {
    const history = this.senderHistory[senderEmail] || [];
    if (history.length === 0) return 0.0;

    // Get recent emails (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentEmails = history.filter(email => new Date(email.date) >= sevenDaysAgo);

    if (recentEmails.length === 0) return 0.0;

    const similarEmails = recentEmails.filter(email => email.contentHash === currentContentHash);
    return similarEmails.length / recentEmails.length;
  }

  private calculateSubjectChangeRate(senderEmail: string, currentSubject: string): number {
    const history = this.senderHistory[senderEmail] || [];
    if (history.length < 2) return 0.0;

    // Get recent emails (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentEmails = history.filter(email => new Date(email.date) >= thirtyDaysAgo);

    if (recentEmails.length < 2) return 0.0;

    // Calculate how often subject changes
    let changes = 0;
    let prevSubject = recentEmails[0].subject;
    
    for (let i = 1; i < recentEmails.length; i++) {
      if (recentEmails[i].subject !== prevSubject) {
        changes++;
      }
      prevSubject = recentEmails[i].subject;
    }

    // Check current subject against last known
    if (recentEmails.length > 0 && currentSubject !== recentEmails[recentEmails.length - 1].subject) {
      changes++;
    }

    return changes / Math.max(recentEmails.length, 1);
  }

  private calculateTimeAnomalyScore(senderEmail: string, currentDate: Date): number {
    const history = this.senderHistory[senderEmail] || [];
    if (history.length < 5) return 0.0;

    const currentHour = currentDate.getHours();
    const currentDay = this.getDayOfWeek(currentDate);

    // Analyze historical patterns
    const hourDistribution: { [hour: number]: number } = {};
    const dayDistribution: { [day: string]: number } = {};

    history.forEach(email => {
      const emailDate = new Date(email.date);
      const hour = emailDate.getHours();
      const day = this.getDayOfWeek(emailDate);

      hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
      dayDistribution[day] = (dayDistribution[day] || 0) + 1;
    });

    // Calculate how unusual current time is
    const totalEmails = history.length;
    const currentHourFreq = (hourDistribution[currentHour] || 0) / totalEmails;
    const currentDayFreq = (dayDistribution[currentDay] || 0) / totalEmails;

    // Score: lower frequency = higher anomaly
    const hourAnomaly = 1 - currentHourFreq;
    const dayAnomaly = 1 - currentDayFreq;

    // Special penalty for night hours (2-5 AM) if rarely used
    let nightPenalty = 0;
    if (currentHour >= 2 && currentHour <= 5) {
      const nightEmails = Object.entries(hourDistribution)
        .filter(([hour]) => parseInt(hour) >= 2 && parseInt(hour) <= 5)
        .reduce((sum, [, count]) => sum + count, 0);
      
      if (nightEmails / totalEmails < 0.1) { // Less than 10% of emails sent at night
        nightPenalty = 0.5;
      }
    }

    return Math.min((hourAnomaly + dayAnomaly + nightPenalty) / 2, 1.0);
  }

  private calculateReputationScore(metrics: Partial<BehavioralAnalysisResult>): number {
    let score = 0.5; // Start with neutral score

    // New sender penalty
    if (metrics.isNewSender) {
      score -= 0.2;
    }

    // High volume penalty
    if (metrics.emailCountLast24h && metrics.emailCountLast24h > 20) {
      score -= 0.3;
    }

    // Burst activity penalty
    if (metrics.burstRatio && metrics.burstRatio > 5) {
      score -= 0.25;
    }

    // High content similarity penalty (mass mailing)
    if (metrics.contentSimilarityRate && metrics.contentSimilarityRate > 0.8) {
      score -= 0.2;
    }

    // Time anomaly penalty
    if (metrics.timeAnomalyScore && metrics.timeAnomalyScore > 0.7) {
      score -= 0.15;
    }

    // Subject change rate penalty (randomized subjects)
    if (metrics.subjectChangeRate && metrics.subjectChangeRate > 0.8) {
      score -= 0.1;
    }

    return Math.max(0, Math.min(1, score));
  }

  analyzeBehavior(
    from: string,
    date: string,
    subject: string,
    recipientsCount: number,
    content: string
  ): BehavioralAnalysisResult {
    const currentDate = new Date(date);
    const senderEmail = from.toLowerCase().trim();
    const contentHash = this.generateContentHash(content);

    // Get sender history
    const history = this.senderHistory[senderEmail] || [];
    const isNewSender = history.length === 0;

    // Calculate time-based metrics
    const last24h = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const emailCountLast24h = history.filter(email => new Date(email.date) >= last24h).length;
    const emailCountLast7d = history.filter(email => new Date(email.date) >= last7d).length;

    // Calculate behavioral metrics
    const burstRatio = this.calculateBurstRatio(senderEmail, currentDate);
    const contentSimilarityRate = this.calculateContentSimilarity(senderEmail, contentHash);
    const subjectChangeRate = this.calculateSubjectChangeRate(senderEmail, subject);
    const timeAnomalyScore = this.calculateTimeAnomalyScore(senderEmail, currentDate);

    // Calculate average recipients
    const avgRecipients = history.length > 0 
      ? history.reduce((sum, email) => sum + email.recipientsCount, 0) / history.length 
      : recipientsCount;

    // Mass mailing indicator
    const massMailingIndicator = (
      emailCountLast24h > 10 ||
      burstRatio > 3 ||
      contentSimilarityRate > 0.9 ||
      recipientsCount > 20
    );

    const result: BehavioralAnalysisResult = {
      from: senderEmail,
      isNewSender,
      emailCountLast24h: emailCountLast24h + 1, // Include current email
      emailCountLast7d: emailCountLast7d + 1,
      burstRatio,
      avgRecipients,
      hourOfDay: currentDate.getHours(),
      dayOfWeek: this.getDayOfWeek(currentDate),
      contentSimilarityRate,
      subjectChangeRate,
      timeAnomalyScore,
      massMailingIndicator,
      reputationScore: 0, // Will be calculated below
      firstSeenDate: isNewSender ? date : history[0]?.date
    };

    // Calculate reputation score based on all metrics
    result.reputationScore = this.calculateReputationScore(result);

    // Store current email in history
    const emailRecord: EmailRecord = {
      date,
      subject,
      recipientsCount,
      contentHash,
      hourOfDay: currentDate.getHours(),
      dayOfWeek: this.getDayOfWeek(currentDate)
    };

    if (!this.senderHistory[senderEmail]) {
      this.senderHistory[senderEmail] = [];
    }

    this.senderHistory[senderEmail].push(emailRecord);

    // Keep only last 100 emails per sender to limit storage
    if (this.senderHistory[senderEmail].length > 100) {
      this.senderHistory[senderEmail] = this.senderHistory[senderEmail].slice(-100);
    }

    // Save updated history
    this.saveHistory();

    return result;
  }

  // Get sender statistics for debugging/monitoring
  getSenderStats(senderEmail: string): {
    totalEmails: number;
    firstSeen: string | null;
    lastSeen: string | null;
    avgEmailsPerDay: number;
  } {
    const history = this.senderHistory[senderEmail.toLowerCase()] || [];
    
    if (history.length === 0) {
      return {
        totalEmails: 0,
        firstSeen: null,
        lastSeen: null,
        avgEmailsPerDay: 0
      };
    }

    const firstSeen = history[0].date;
    const lastSeen = history[history.length - 1].date;
    const daysDiff = Math.max(1, (new Date(lastSeen).getTime() - new Date(firstSeen).getTime()) / (1000 * 60 * 60 * 24));

    return {
      totalEmails: history.length,
      firstSeen,
      lastSeen,
      avgEmailsPerDay: history.length / daysDiff
    };
  }

  // Clear old data (for maintenance)
  cleanupOldData(daysToKeep: number = 90): void {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    Object.keys(this.senderHistory).forEach(senderEmail => {
      this.senderHistory[senderEmail] = this.senderHistory[senderEmail].filter(
        email => new Date(email.date) >= cutoffDate
      );

      // Remove senders with no recent emails
      if (this.senderHistory[senderEmail].length === 0) {
        delete this.senderHistory[senderEmail];
      }
    });

    this.saveHistory();
  }
}