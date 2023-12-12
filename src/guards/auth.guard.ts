import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {JwtService} from '@nestjs/jwt';
import {SignatureContent} from 'src/shared/types';
import {extractTokenFromHeader} from 'src/shared/utils/extractTokenFromHeader';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync<SignatureContent>(
        token,
        {
          secret: this.configService.getOrThrow('SC'),
        },
      );

      request['userId'] = payload.userId;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}
