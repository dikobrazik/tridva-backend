import {Body, Controller, Post} from '@nestjs/common';
import {AuthorizationService} from './authorization.service';
import {ApiTags} from '@nestjs/swagger';
import {CheckCodeDto, GetCodeDto} from './dtos';

@ApiTags('auth')
@Controller('auth')
export class AuthorizationController {
  constructor(private authService: AuthorizationService) {}

  @Post('/get-code')
  getCode(@Body() getCodeBody: GetCodeDto) {
    return this.authService.sendCode(getCodeBody.phone);
  }

  @Post('/check-code')
  signIn(@Body() payload: CheckCodeDto) {
    return this.authService.signInOrUp(payload);
  }
}
