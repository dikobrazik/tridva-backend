import {Strategy} from 'passport-local';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class AdminLocalStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super();
  }

  async validate(username: string, password: string) {
    const isUserValid =
      username === this.configService.get('ADMIN_USERNAME') &&
      password === this.configService.get('ADMIN_PASSWORD');
    if (!isUserValid) {
      throw new UnauthorizedException();
    }
    return isUserValid;
  }
}
