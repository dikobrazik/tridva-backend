import {Body, Controller, Inject, Put, UseGuards} from '@nestjs/common';
import {ApiBody} from '@nestjs/swagger';
import {UpdateProfileDto} from './dtos';
import {AuthTokenGuard} from 'src/guards/auth-token.guard';
import {ProfileService} from './profile.service';

@Controller('profile')
export class ProfileController {
  @Inject(ProfileService)
  private profileService: ProfileService;

  @UseGuards(AuthTokenGuard)
  @Put()
  @ApiBody({type: [UpdateProfileDto]})
  updateProfile(@Body() profile: UpdateProfileDto) {
    this.profileService.updateProfile(profile);
  }
}
