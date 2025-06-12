import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { parseSingleEmail, ParsedEmail } from '../../utils/parse-email';

@Injectable()
export class ParsingService {
  async parseEmailFile(filename: string): Promise<{
    parsed: ParsedEmail;
  }> {
    const filePath = path.join(process.cwd(), 'storage', filename);

    console.log('Looking for file:', filePath);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filename}`);
    }

    const parsed = await parseSingleEmail(filePath);
    return { parsed };
  }
}
