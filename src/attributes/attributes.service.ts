import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Attribute} from 'src/entities/Attribute';
import {OfferAttribute} from 'src/entities/OfferAttribute';
import {Repository} from 'typeorm';

@Injectable()
export class AttributesService {
  @InjectRepository(Attribute)
  private attributeRepository: Repository<Attribute>;
  @InjectRepository(OfferAttribute)
  private offerAttributeRepository: Repository<OfferAttribute>;

  public async getOfferAttributes(offerId: number) {
    const offerAttributes = await this.offerAttributeRepository.find({
      where: {offerId},
      relations: {attribute: true},
    });

    return offerAttributes.map((offerAttribute) => ({
      id: offerAttribute.id,
      attributeName: offerAttribute.attribute.name,
      value: offerAttribute.value,
    }));
  }

  public async getOfferAttributesCount(offerId: number) {
    return await this.offerAttributeRepository.count({
      where: {offerId},
    });
  }
}
