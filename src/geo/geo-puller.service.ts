import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {City} from 'src/entities/City';
import {PickupPoint} from 'src/entities/PickupPoint';
import {Repository} from 'typeorm';

@Injectable()
export class GeoPullerService {
  @InjectRepository(City)
  private cityRepository: Repository<City>;

  @InjectRepository(PickupPoint)
  private pickupPointRepository: Repository<PickupPoint>;

  public async initialize() {
    // const {
    //   identifiers: [{id}],
    // } = await this.cityRepository.upsert([{name: 'Самара'}], ['name']);
  }
}
