import {
  Body,
  Controller,
  HttpStatus,
  Inject,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {AuthorizationService} from './authorization.service';
import {ApiTags} from '@nestjs/swagger';
import {CheckCodeDto, GetCodeDto} from './dtos';
import {Response} from 'express';
import {AuthTokenGuard} from 'src/guards/auth/token.guard';
import {UserId} from 'src/shared/decorators/UserId';
import {Token} from 'src/shared/decorators/Token';

@ApiTags('auth')
@Controller('auth')
export class AuthorizationController {
  @Inject(AuthorizationService)
  private authService: AuthorizationService;

  @Post('/check')
  async checkUserToken(
    @Token() token: string,
    @Res({passthrough: true}) response: Response,
  ) {
    response.statusCode = HttpStatus.OK;

    if (token) {
      const user = await this.authService.getTokenUser(token);

      if (user) {
        const isAnonymous = await this.authService.isUserAnonymous(user);

        const {phone, profile} = user;

        return {isAnonymous, phone, profile};
      }
    }

    const {access_token, phone, profile} =
      await this.authService.createAnonymous();

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
    @UserId() userId: number,
    @Res({passthrough: true}) response: Response,
  ) {
    const {access_token, profile} = await this.authService.signInOrUp(
      userId,
      payload,
    );

    response.cookie('token', access_token);

    return profile;
  }
}
