import {
  Body,
  Controller,
  Inject,
  Put,
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

  @Put()
  @ApiBody({type: [UpdateProfileDto]})
  async updateProfile(
    @Body() profile: UpdateProfileDto,
    @Request() request: AppRequest,
  ) {
    await this.profileService.updateProfile(request.userId, profile);
  }
}
