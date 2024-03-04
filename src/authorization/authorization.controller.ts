import {
  Body,
  Controller,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {AuthorizationService} from './authorization.service';
import {ApiTags} from '@nestjs/swagger';
import {CheckCodeDto, GetCodeDto} from './dtos';
import {Request, Response} from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthorizationController {
  @Inject(AuthorizationService)
  private authService: AuthorizationService;

  @Post('/anonymous')
  async createAnonymous(
    @Req() request: Request,
    @Res({passthrough: true}) response: Response,
  ) {
    if (
      request.cookies['token'] &&
      this.authService.isAccessTokenValid(request.cookies['token'])
    ) {
      response.statusCode = HttpStatus.NO_CONTENT;
      return;
    }

    const {access_token} = await this.authService.createAnonymous();

    response.cookie('token', access_token);
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
