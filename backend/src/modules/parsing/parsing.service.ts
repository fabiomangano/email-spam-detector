import { Injectable } from '@nestjs/common';
import { parseEmailFile } from '../../utils/parsing.util';
import { ParsedEmail } from '../../utils/parse-email';

@Injectable()
export class ParsingService {
  async parseEmailFile(filename: string): Promise<{
    parsed: ParsedEmail;
  }> {
    return parseEmailFile(filename);
  }
}
