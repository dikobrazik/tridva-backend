import {Module} from '@nestjs/common';
import {ReviewsService} from './reviews.service';
import {ReviewsController} from './reviews.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Review} from 'src/entities/Review';
import {JwtModule} from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Review]), JwtModule],
  providers: [ReviewsService],
  controllers: [ReviewsController],
})
export class ReviewsModule {}
