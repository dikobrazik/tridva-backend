import {Body, Controller, Inject, Post} from '@nestjs/common';
import {AuthorizationService} from './authorization.service';
import {ApiTags} from '@nestjs/swagger';
import {CheckCodeDto, GetCodeDto} from './dtos';

@ApiTags('auth')
@Controller('auth')
export class AuthorizationController {
  @Inject(AuthorizationService)
  private authService: AuthorizationService;

  @Post('/anonymous')
  createAnonymous() {
    return this.authService.createAnonymous();
  }

  @Post('/get-code')
  getCode(@Body() getCodeBody: GetCodeDto) {
    return this.authService.sendCode(getCodeBody.phone);
  }

  @Post('/check-code')
  signIn(@Body() payload: CheckCodeDto) {
    return this.authService.signInOrUp(payload);
  }
}
