import {Module} from '@nestjs/common';
import {PullerService} from './puller.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Category} from 'src/entities/Category';
import {ConfigModule} from '@nestjs/config';
import {Offer} from 'src/entities/Offer';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Offer]), ConfigModule],
  providers: [PullerService],
})
export class PullerModule {}
