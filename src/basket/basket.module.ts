import {Module} from '@nestjs/common';
import {BasketService} from './basket.service';
import {BasketController} from './basket.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {BasketItem} from 'src/entities/BasketItem';
import {JwtModule} from '@nestjs/jwt';
import {User} from 'src/entities/User';

@Module({
  imports: [JwtModule, TypeOrmModule.forFeature([BasketItem, User])],
  providers: [BasketService],
  controllers: [BasketController],
})
export class BasketModule {}
