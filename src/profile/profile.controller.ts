import {
  Body,
  Controller,
  Inject,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import {ApiBody} from '@nestjs/swagger';
import {UpdateProfileDto} from './dtos';
import {AuthTokenGuard} from 'src/guards/auth-token.guard';
import {ProfileService} from './profile.service';
import {AppRequest} from 'src/shared/types';

@UseGuards(AuthTokenGuard)
@Controller('profile')
export class ProfileController {
  @Inject(ProfileService)
  private profileService: ProfileService;

  @Patch()
  @ApiBody({type: [UpdateProfileDto]})
  async patchProfile(
    @Body() profile: UpdateProfileDto,
    @Request() request: AppRequest,
  ) {
    await this.profileService.updateProfile(request.userId, profile);
  }
}
