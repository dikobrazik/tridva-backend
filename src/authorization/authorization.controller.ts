import {
  Body,
  Controller,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {AuthorizationService} from './authorization.service';
import {ApiTags} from '@nestjs/swagger';
import {CheckCodeDto, GetCodeDto} from './dtos';
import {Request, Response} from 'express';
import {AppRequest} from 'src/shared/types';
import {AuthTokenGuard} from 'src/guards/auth-token.guard';

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

      const {phone, profile} = await this.authService.getUser(userId);

      return {isAnonymous, phone, profile};
    }

    const {access_token, userId} = await this.authService.createAnonymous();
    const {phone, profile} = await this.authService.getUser(userId);

    response.cookie('token', access_token);

    return {isAnonymous: true, phone, profile};
  }

  @Post('/get-code')
  getCode(@Body() getCodeBody: GetCodeDto) {
    return this.authService.sendCode(getCodeBody.phone);
  }

  @Post('/check-code')
  @UseGuards(AuthTokenGuard)
  async signIn(
    @Body() payload: CheckCodeDto,
    @Req() request: AppRequest,
    @Res({passthrough: true}) response: Response,
  ) {
    const {access_token, profile} = await this.authService.signInOrUp(
      request.userId,
      payload,
    );

    response.cookie('token', access_token);

    return profile;
  }
}
