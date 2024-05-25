import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {City} from 'src/entities/City';
import {PickupPoint} from 'src/entities/PickupPoint';
import {Repository} from 'typeorm';

@Injectable()
export class GeoService {
  @InjectRepository(City)
  private cityRepository: Repository<City>;

  @InjectRepository(PickupPoint)
  private pickupPointRepository: Repository<PickupPoint>;

  getAllCities() {
    return this.cityRepository.find();
  }

  getCityPickupPoints(cityId: number) {
    return this.pickupPointRepository.find({
      where: {city: {id: cityId}},
    });
  }
}
