import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Put,
  Redirect,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {ApiBody} from '@nestjs/swagger';
import {UpdateProfileDto} from './dtos';
import {AuthTokenGuard} from 'src/guards/auth/token.guard';
import {ProfileService} from './profile.service';
import {UserId} from 'src/shared/decorators/UserId';
import {FileInterceptor} from '@nestjs/platform-express';
import {ProfileAvatarService} from './profile-avatar.service';

@Controller('profile')
export class ProfileController {
  @Inject(ProfileService)
  private profileService: ProfileService;
  @Inject(ProfileAvatarService)
  private profileAvatarService: ProfileAvatarService;

  @Patch()
  @ApiBody({type: [UpdateProfileDto]})
  @UseGuards(AuthTokenGuard)
  async patchProfile(
    @Body() profile: UpdateProfileDto,
    @UserId() userId: number,
  ) {
    await this.profileService.updateProfile(userId, profile);
  }

  @Put('/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthTokenGuard)
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @UserId() userId: number,
  ): Promise<string> {
    return this.profileAvatarService.updateProfileAvatar(userId, file);
  }

  @Get('/avatar/:id')
  @Redirect()
  async getAvatar(@Param('id') id: number) {
    const avatarHash = await this.profileAvatarService.getProfileAvatarHash(id);

    return {
      url: `https://storage.yandexcloud.net/td-avatars/${avatarHash}`,
    };
  }
}
