import {
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {randomUUID} from 'crypto';

@Injectable()
export class ObjectStorageService {
  private client: S3Client;

  constructor(private configService: ConfigService) {
    const s3Endpoint = configService.getOrThrow('S3_ENDPOINT');
    const s3Region = configService.getOrThrow('S3_REGION');
    const accessKeyId = configService.getOrThrow('S3_ACCESS_KEY_ID');
    const secretAccessKey = configService.getOrThrow('S3_SECRET_ACCESS_KEY');

    this.client = new S3Client({
      region: s3Region,
      endpoint: s3Endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  public putObject(
    bucketName: string,
    file: Express.Multer.File,
    key?: string,
  ) {
    key = key ? key : randomUUID();

    return this.client
      .send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: file.buffer,
        }),
      )
      .then(() => key);
  }

  public deleteObject(bucketName: string, key: string) {
    return this.client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
    );
  }
}
