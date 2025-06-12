import { Controller, Post, UploadedFile, Body, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

const storageDir = path.join(process.cwd(), 'storage');
if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });

@Controller('upload')
export class UploadController {
  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: storageDir,
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowed = ['.eml', '.msg', '.txt'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) cb(null, true);
        else cb(new Error('Invalid file type'), false);
      },
      limits: {
        fileSize: 5 * 1024 * 1024
}
    }),
  )
  uploadFile(@UploadedFile() file: any) {
    return {
      type: 'file',
      filename: file.filename,
      originalname: file.originalname,
      path: file.path,
      size: file.size,
    };
  }

  @Post('text')
  uploadText(@Body('text') text: string) {
    if (!text || typeof text !== 'string') {
      throw new Error('Campo "text" obbligatorio nel body.');
    }

    const timestamp = Date.now();
    const filename = `${timestamp}-input.txt`;
    const filepath = path.join(storageDir, filename);
    fs.writeFileSync(filepath, text);

    return {
      type: 'text',
      filename,
      path: filepath,
      size: Buffer.byteLength(text, 'utf-8'),
    };
  }
}
