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

  public async initialize() {
    const {
      identifiers: [{id}],
    } = await this.cityRepository.upsert([{name: 'Самара'}], ['name']);

    await this.pickupPointRepository.upsert(
      [
        {
          latitude: 53.219601,
          longitude: 50.206111,
          address: 'ул. Советской Армии, 167',
          city: {id},
          phone: '89392312321',
        },
        {
          latitude: 53.216874640417615,
          longitude: 50.191077364990484,
          address: 'пр. Карла Маркса, 196',
          city: {id},
          phone: '89212353213',
        },
      ],
      ['latitude', 'longitude'],
    );
  }

  getAllCities() {
    return this.cityRepository.find();
  }

  getCityPickupPoints(cityId: number) {
    return this.pickupPointRepository.find({
      where: {city: {id: cityId}},
    });
  }

  getIsPickupPointExist(pickupPointId: number) {
    return this.pickupPointRepository.exist({
      where: {id: pickupPointId},
    });
  }
}
