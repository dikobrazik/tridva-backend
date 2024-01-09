import {Module} from '@nestjs/common';
import {PullerService} from './puller.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Category} from 'src/entities/Category';
import {ConfigModule} from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), ConfigModule],
  providers: [PullerService],
})
export class PullerModule {}
