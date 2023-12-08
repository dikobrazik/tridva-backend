import {Body, Controller, Post} from '@nestjs/common';
import {AuthorizationService} from './authorization.service';
import {UserDto} from 'src/dtos/user';

@Controller('auth')
export class AuthorizationController {
  constructor(private authService: AuthorizationService) {}

  @Post('/sign-in')
  signIn(@Body() signInDto: UserDto) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Post('/sign-up')
  register(@Body() signInDto: UserDto) {
    return this.authService.signUp(signInDto.username, signInDto.password);
  }
}
