import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import * as AWS from 'aws-sdk';

// 버킷이름은 굉장히 unique하게 만들어줘야함
// Amazon전체에서 유일한 이름으로
const BUCKET_NAME = 'fairyflossnestjsupload';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly configService: ConfigService) {}
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file) {
    // AWS S3 업로드시 인증 정보 및 업로드 양식
    AWS.config.update({
      credentials: {
        accessKeyId: this.configService.get('AWS_KEY'),
        secretAccessKey: this.configService.get('AWS_SECRET'),
      },
    });
    try {
      // 업로드양식
      const objectName = `${Date.now() + file.originalname}`;
      await new AWS.S3()
        .putObject({
          Body: file.buffer,
          Bucket: BUCKET_NAME,
          Key: objectName,
          //   권한 설정을위한 옵션
          ACL: 'public-read',
        })
        .promise();
      // AWS S3에 저장되는 파일의 경로 규칙
      const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${objectName}`;
      //   즉 파일업로드후 파일이 저장된 AWS S3의 경로를 반환해준다
      //   이걸가지고 orm에 저장하면 됨
      return { url };
    } catch (e) {
      return null;
    }
  }
}
