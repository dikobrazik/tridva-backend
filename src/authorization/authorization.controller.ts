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

  @Post('/check')
  async checkUserToken(
    @Req() request: Request,
    @Res({passthrough: true}) response: Response,
  ) {
    const token = request.cookies['token'];
    response.statusCode = HttpStatus.OK;

    if (token && (await this.authService.isAccessTokenValid(token))) {
      const userId = await this.authService.parseAccessToken(token);
      const isAnonymous = await this.authService.isUserAnonymous(token);

      if (!isAnonymous) {
        const {phone, profile} = await this.authService.getUser(userId);

        return {isAnonymous, phone, profile};
      }

      return {isAnonymous};
    }

    const {access_token} = await this.authService.createAnonymous();

    response.cookie('token', access_token);

    return {isAnonymous: true};
  }

  @Post('/get-code')
  getCode(@Body() getCodeBody: GetCodeDto) {
    return this.authService.sendCode(getCodeBody.phone);
  }

  @Post('/check-code')
  async signIn(
    @Body() payload: CheckCodeDto,
    @Res({passthrough: true}) response: Response,
  ) {
    const {access_token} = await this.authService.signInOrUp(payload);

    response.cookie('token', access_token);
  }
}
