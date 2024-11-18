import {Module} from '@nestjs/common';
import {GeoController} from './geo.controller';
import {GeoService} from './geo.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {City} from 'src/entities/City';
import {PickupPoint} from 'src/entities/PickupPoint';

@Module({
  imports: [TypeOrmModule.forFeature([City, PickupPoint])],
  controllers: [GeoController],
  providers: [GeoService],
  exports: [GeoService],
})
export class GeoModule {}
