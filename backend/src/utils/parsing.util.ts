import * as path from 'path';
import * as fs from 'fs';
import { parseSingleEmail, ParsedEmail } from './parse-email';

export async function parseEmailFile(filename: string): Promise<{
  parsed: ParsedEmail;
}> {
  const filePath = path.join(process.cwd(), 'storage', filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filename}`);
  }

  const parsed = await parseSingleEmail(filePath);
  return { parsed };
}