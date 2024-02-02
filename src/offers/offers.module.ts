import {Module} from '@nestjs/common';
import {OffersController} from './offers.controller';
import {OffersService} from './offers.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Offer} from 'src/entities/Offer';
import {Category} from 'src/entities/Category';
import {CategoryService} from 'src/category/category.service';

@Module({
  imports: [TypeOrmModule.forFeature([Offer, Category])],
  controllers: [OffersController],
  providers: [OffersService, CategoryService],
  exports: [OffersService],
})
export class OffersModule {}
