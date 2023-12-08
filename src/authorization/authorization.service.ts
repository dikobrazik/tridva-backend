import {Injectable, UnauthorizedException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {InjectRepository} from '@nestjs/typeorm';
import {User} from 'src/entities/User';
import {Repository} from 'typeorm';

@Injectable()
export class AuthorizationService {
  @InjectRepository(User)
  private userRepository: Repository<User>;

  constructor(private jwtService: JwtService) {}

  async signIn(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({where: {username}});

    if (user?.password !== password) {
      throw new UnauthorizedException();
    }

    return {
      access_token: await this.jwtService.signAsync({
        sub: user.id,
        username: user.username,
      }),
    };
  }

  async signUp(username: string, password: string): Promise<any> {
    const user = this.userRepository.create({
      username,
      password,
    });

    return {
      access_token: await this.jwtService.signAsync({
        sub: user.id,
        username: user.username,
      }),
    };
  }
}
