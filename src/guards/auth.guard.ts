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
import {User} from 'src/entities/User';
import {SignatureContent} from 'src/shared/types';
import {extractTokenFromHeader} from 'src/shared/utils/extractTokenFromHeader';
import {Repository} from 'typeorm';

@Injectable()
export class AuthGuard implements CanActivate {
  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;

  @InjectRepository(User)
  private userRepository: Repository<User>;

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

      if (payload.userId) {
        const user = await this.userRepository.findOne({
          where: {id: payload.userId},
        });

        if (!user.phone) {
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
