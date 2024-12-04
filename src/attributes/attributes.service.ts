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

    const offerAttributesEntries = offerAttributes
      .filter(
        (offerAttribute) =>
          offerAttribute.value !== 'Empty' &&
          ![5935, 7868].includes(offerAttribute.attributeId),
      )
      .reduce((offerAttributes, offerAttribute) => {
        offerAttributes[offerAttribute.attribute.name] = (
          offerAttributes[offerAttribute.attribute.name] || []
        ).concat(offerAttribute.value);

        return offerAttributes;
      }, {} as Record<string, string[]>);

    return Object.entries(offerAttributesEntries).map(
      ([attributeName, attributeValues], index) => ({
        id: index,
        attributeName: attributeName,
        value: attributeValues.join(', '),
      }),
    );
  }

  public async getOfferAttributesCount(offerId: number) {
    return await this.offerAttributeRepository.count({
      where: {offerId},
    });
  }
}
