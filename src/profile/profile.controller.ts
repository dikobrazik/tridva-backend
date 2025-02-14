import {
  Body,
  Controller,
  Inject,
  Patch,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {ApiBody} from '@nestjs/swagger';
import {UpdateProfileDto} from './dtos';
import {AuthTokenGuard} from 'src/guards/auth/token.guard';
import {ProfileService} from './profile.service';
import {UserId} from 'src/shared/decorators/UserId';
import {S3Client, PutObjectCommand} from '@aws-sdk/client-s3';
import {AuthenticatedGuard} from 'src/admin/auth/guards/auth.guard';
import {FileInterceptor} from '@nestjs/platform-express';
import {ConfigService} from '@nestjs/config';

@UseGuards(AuthTokenGuard)
@Controller('profile')
export class ProfileController {
  @Inject(ProfileService)
  private profileService: ProfileService;

  @Inject(ConfigService)
  private configServer: ConfigService;

  @Patch()
  @ApiBody({type: [UpdateProfileDto]})
  async patchProfile(
    @Body() profile: UpdateProfileDto,
    @UserId() userId: number,
  ) {
    await this.profileService.updateProfile(userId, profile);
  }

  @Put('/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthenticatedGuard)
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @UserId() userId: number,
  ) {
    const s3Endpoint = this.configServer.getOrThrow('S3_ENDPOINT');
    const s3Region = this.configServer.getOrThrow('S3_REGION');
    const accessKeyId = this.configServer.getOrThrow('S3_ACCESS_KEY_ID');
    const secretAccessKey = this.configServer.getOrThrow(
      'S3_SECRET_ACCESS_KEY',
    );
    const bucketName = this.configServer.getOrThrow('AVATARS_BUCKET_NAME');

    const s3Client = new S3Client({
      region: s3Region,
      endpoint: s3Endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: `user-avatar-${userId}`,
        Body: file.buffer,
      }),
    );

    await this.profileService.setProfileHasAvatar(userId, true);
  }
}
