import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  async moveFeedbackFile(filename: string, isSpam: boolean): Promise<{ message: string; moved: boolean }> {
    try {
      // Paths
      const storageDir = path.join(process.cwd(), 'storage');
      const sourceFile = path.join(storageDir, filename);
      
      // SpamAssassin data directory
      const dataDir = path.join(process.cwd(), 'data', 'spamassassin');
      const targetDir = isSpam 
        ? path.join(dataDir, 'spam')
        : path.join(dataDir, 'ham');
      
      // Check if source file exists
      if (!fs.existsSync(sourceFile)) {
        this.logger.error(`Source file not found: ${sourceFile}`);
        throw new Error(`File ${filename} not found in storage`);
      }
      
      // Ensure target directory exists
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        this.logger.log(`Created directory: ${targetDir}`);
      }
      
      // Generate a unique filename to avoid conflicts
      const fileExtension = path.extname(filename);
      const baseName = path.basename(filename, fileExtension);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const targetFilename = `${baseName}_feedback_${timestamp}${fileExtension}`;
      const targetFile = path.join(targetDir, targetFilename);
      
      // Copy the file to the target directory
      fs.copyFileSync(sourceFile, targetFile);
      this.logger.log(`File copied from ${sourceFile} to ${targetFile}`);
      
      // Optional: Keep the original file in storage for now
      // fs.unlinkSync(sourceFile); // Uncomment to delete original
      
      const category = isSpam ? 'spam' : 'ham';
      const message = `File successfully moved to ${category} training folder`;
      
      return {
        message,
        moved: true
      };
      
    } catch (error) {
      this.logger.error(`Error moving feedback file: ${error.message}`);
      throw new Error(`Failed to process feedback: ${error.message}`);
    }
  }
}