import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {LoginDto} from './dtos';
import {Response} from 'express';
import {LoginGuard} from './auth/guards/login.guard';
import {AuthenticatedGuard} from './auth/guards/auth.guard';
import {AuthExceptionFilter} from './auth/filters/auth.filter';

@Controller('admin')
@UseFilters(AuthExceptionFilter)
export class AdminController {
  @Get()
  @Render('index')
  root() {
    return {message: 'Hello world!'};
  }

  @Get('/offers')
  @Render('index')
  @UseGuards(AuthenticatedGuard)
  offers() {
    return {message: 'Hello world!'};
  }

  @Get('/login')
  @Render('login')
  login() {
    return {message: 'Hello world!'};
  }

  @Post('/login')
  @UseGuards(LoginGuard)
  loginUser(@Body() body: LoginDto, @Res() res: Response) {
    res.redirect('/admin');
  }
}
