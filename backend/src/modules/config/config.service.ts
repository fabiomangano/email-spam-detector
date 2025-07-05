import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface SpamDetectionConfig {
  scoring: {
    riskLevels: {
      low: number;
      medium: number;
    };
    weights: {
      technical: number;
      nlp: number;
      behavioral: number;
    };
  };
  technical: {
    penalties: {
      bodyLength: { short: number; veryShort: number };
      links: { excessive: number; highRatio: number };
      images: { excessive: number; heavy: number };
      tracking: { hasTrackingPixel: number };
      attachments: { hasAttachments: number; excessive: number };
      authentication: {
        spfFail: number;
        spfSoftfail: number;
        dkimFail: number;
        dmarcFail: number;
      };
      domains: { excessive: number; externalExcessive: number };
      headers: {
        replyToDiffers: number;
        missingDate: number;
        excessiveReceived: number;
        suspiciousXMailer: number;
      };
      sender: {
        fromNameSuspicious: number;
        fromDomainDisposable: number;
        sentToMultiple: number;
      };
      campaign: { campaignIdentifier: number; feedbackLoopHeader: number };
      text: {
        uppercaseExcessive: number;
        excessiveExclamations: number;
        urgencyWords: number;
        electionTerms: number;
      };
      obfuscation: {
        obfuscatedText: number;
        linkDisplayMismatch: number;
        shortenedUrls: number;
        encodedUrls: number;
      };
      mime: {
        mixedContentTypes: number;
        nestedMultipart: number;
        boundaryAnomaly: number;
        fakeMultipartAlternative: number;
      };
      spam: {
        financialPromises: number;
        nonStandardPorts: number;
        suspiciousDomains: number;
        mailingListSpam: number;
        spammySubject: number;
        suspiciousFromName: number;
        repeatedLinks: number;
      };
    };
    thresholds: {
      bodyLength: { short: number; veryShort: number };
      links: { excessive: number; highRatio: number };
      images: { excessive: number; heavyCount: number; heavyTextLimit: number };
      domains: { excessive: number; externalExcessive: number };
      headers: { excessiveReceived: number };
      text: { uppercaseRatio: number; linkToImageRatio: number };
      mime: { boundaryMaxLength: number };
    };
  };
  nlp: {
    multipliers: {
      toxicity: number;
      sentiment: { negative: number; positive: number };
      spamWords: number;
    };
    thresholds: {
      toxicity: { low: number; medium: number };
      sentiment: { negative: number; positive: number };
      spamWordRatio: number;
    };
  };
  domains: {
    trusted: string[];
    disposable: string[];
    suspicious: string[];
    urlShorteners: string[];
  };
  keywords: {
    legitimateEvents: string[];
    newsletters: string[];
    urgency: string[];
    election: string[];
    spam: string[];
  };
  llm?: {
    providers?: {
      openai?: {
        enabled?: boolean;
        apiKey?: string;
        model?: string;
        temperature?: number;
      };
      anthropic?: {
        enabled?: boolean;
        apiKey?: string;
        model?: string;
        temperature?: number;
      };
      local?: {
        enabled?: boolean;
        model?: string;
        provider?: string;
        endpoint?: string;
      };
    };
    activeProvider?: string;
    prompts?: {
      spam_analysis?: string;
    };
  };
}

@Injectable()
export class ConfigService {
  private configPath = path.join(process.cwd(), 'config', 'spam-config.json');
  private defaultConfigPath = path.join(
    process.cwd(),
    'config',
    'default-config.json',
  );
  private config: SpamDetectionConfig;

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      // Try to load user config first
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf8');
        this.config = JSON.parse(configData);
      } else {
        // Fall back to default config
        const defaultConfig = fs.readFileSync(this.defaultConfigPath, 'utf8');
        this.config = JSON.parse(defaultConfig);
        // Create user config from default
        this.saveConfig(this.config);
      }
    } catch (error) {
      console.error('Error loading config:', error);
      throw new Error('Failed to load spam detection configuration');
    }
  }

  getConfig(): SpamDetectionConfig {
    return this.config;
  }

  saveConfig(newConfig: SpamDetectionConfig): void {
    try {
      const configDir = path.dirname(this.configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      fs.writeFileSync(this.configPath, JSON.stringify(newConfig, null, 2));
      this.config = newConfig;
    } catch (error) {
      console.error('Error saving config:', error);
      throw new Error('Failed to save spam detection configuration');
    }
  }

  resetToDefault(): void {
    try {
      const defaultConfig = fs.readFileSync(this.defaultConfigPath, 'utf8');
      const parsedDefault = JSON.parse(defaultConfig);
      this.saveConfig(parsedDefault);
    } catch (error) {
      console.error('Error resetting config:', error);
      throw new Error('Failed to reset configuration to default');
    }
  }

  updateConfig(newConfig: SpamDetectionConfig): void {
    this.saveConfig(newConfig);
  }

  getDefaultConfig(): SpamDetectionConfig {
    try {
      const defaultConfig = fs.readFileSync(this.defaultConfigPath, 'utf8');
      return JSON.parse(defaultConfig);
    } catch (error) {
      console.error('Error loading default config:', error);
      throw new Error('Failed to load default configuration');
    }
  }

  // Utility methods for specific config sections
  getTechnicalPenalties() {
    return this.config.technical.penalties;
  }

  getTechnicalThresholds() {
    return this.config.technical.thresholds;
  }

  getNlpMultipliers() {
    return this.config.nlp.multipliers;
  }

  getNlpThresholds() {
    return this.config.nlp.thresholds;
  }

  getScoringWeights() {
    return this.config.scoring.weights;
  }

  getRiskLevels() {
    return this.config.scoring.riskLevels;
  }

  getKeywords() {
    return this.config.keywords;
  }

  getDomains() {
    return this.config.domains;
  }
}
