import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadController } from './email-upload/upload.controller';

@Module({
  imports: [],
  controllers: [AppController, UploadController],
  providers: [AppService],
})
export class AppModule {}
