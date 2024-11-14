import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {JwtService} from '@nestjs/jwt';
import {InjectRepository} from '@nestjs/typeorm';
import {Request} from 'express';
import {User} from 'src/entities/User';
import {SignatureContent} from 'src/shared/types';
import {extractTokenFromRequest} from 'src/shared/utils/extractTokenFromHeader';
import {Repository} from 'typeorm';

@Injectable()
export class AuthTokenGuard implements CanActivate {
  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;

  @InjectRepository(User)
  private userRepository: Repository<User>;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request;
    const token = extractTokenFromRequest(request);

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

      if (payload.userId) {
        const isUserExist = await this.userRepository.exist({
          where: {id: payload.userId},
        });

        if (!isUserExist) {
          throw new UnauthorizedException();
        }
      }

      request['userId'] = payload.userId;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}
