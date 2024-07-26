import {Module} from '@nestjs/common';
import {AttributesController} from './attributes.controller';
import {AttributesService} from './attributes.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Attribute} from 'src/entities/Attribute';
import {OfferAttribute} from 'src/entities/OfferAttribute';

@Module({
  imports: [TypeOrmModule.forFeature([Attribute, OfferAttribute])],
  controllers: [AttributesController],
  providers: [AttributesService],
  exports: [AttributesService],
})
export class AttributesModule {}
