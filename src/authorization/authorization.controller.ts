import {
  BadRequestException,
  Body,
  Controller,
  Get,
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
import {AuthenticationService} from './authentication.service';

@ApiTags('auth')
@Controller('auth')
export class AuthorizationController {
  @Inject(AuthorizationService)
  private authorizationService: AuthorizationService;
  @Inject(AuthenticationService)
  private authenticationService: AuthenticationService;

  @Get('/user')
  async getUser(@Token() token: string) {
    if (token) {
      const user = await this.authorizationService.getTokenUser(token);

      if (user) {
        const isAnonymous = await this.authorizationService.isUserAnonymous(
          user,
        );

        const {phone, profile} = user;

        return {isAnonymous, phone, profile};
      }
    }

    throw new BadRequestException();
  }

  // todo: защититься от спама в ручку
  @Post('/create-anonymous')
  async createAnonymous(@Res({passthrough: true}) response: Response) {
    response.statusCode = HttpStatus.OK;

    const {access_token} = await this.authorizationService.createAnonymous();

    return {token: access_token};
  }

  @Post('/get-code')
  getCode(@Body() getCodeBody: GetCodeDto) {
    return this.authenticationService.sendCode(getCodeBody.phone);
  }

  @Post('/logout')
  async logout(@Res({passthrough: true}) response: Response) {
    response.statusCode = HttpStatus.OK;

    const {access_token} = await this.authorizationService.createAnonymous();

    response.cookie('token', access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
  }

  @Post('/check-code')
  @UseGuards(AuthTokenGuard)
  async signIn(
    @Body() payload: CheckCodeDto,
    @UserId() userId: number,
    @Res({passthrough: true}) response: Response,
  ) {
    const {access_token, profile} = await this.authorizationService.signInOrUp(
      userId,
      payload,
    );

    response.cookie('token', access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return profile;
  }
}
