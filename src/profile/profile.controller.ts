import {Body, Controller, Inject, Patch, UseGuards} from '@nestjs/common';
import {ApiBody} from '@nestjs/swagger';
import {UpdateProfileDto} from './dtos';
import {AuthTokenGuard} from 'src/guards/auth/token.guard';
import {ProfileService} from './profile.service';
import {UserId} from 'src/shared/decorators/UserId';

@UseGuards(AuthTokenGuard)
@Controller('profile')
export class ProfileController {
  @Inject(ProfileService)
  private profileService: ProfileService;

  @Patch()
  @ApiBody({type: [UpdateProfileDto]})
  async patchProfile(
    @Body() profile: UpdateProfileDto,
    @UserId() userId: number,
  ) {
    await this.profileService.updateProfile(userId, profile);
  }
}
