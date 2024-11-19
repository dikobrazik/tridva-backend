import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {FavoriteOffer} from 'src/entities/FavoriteOffer';
import {Offer} from 'src/entities/Offer';
import {LIST_OFFER_VIEW} from 'src/entity-views/offer';
import {Repository} from 'typeorm';

@Injectable()
export class FavoriteOffersService {
  @InjectRepository(Offer)
  private offerRepository: Repository<Offer>;
  @InjectRepository(FavoriteOffer)
  private favoriteOffersRepository: Repository<FavoriteOffer>;

  async getIsFavoriteOffer(offerId: Offer['id'], userId: number) {
    return this.favoriteOffersRepository.exist({
      where: {
        offerId,
        userId,
      },
    });
  }

  async getFavoriteOffers(userId: number) {
    return this.favoriteOffersRepository
      .find({
        select: {offer: LIST_OFFER_VIEW},
        where: {
          userId,
        },
        relations: {offer: true},
      })
      .then((favoriteOffers) =>
        favoriteOffers.map((favoriteOffer) => favoriteOffer.offer),
      );
  }

  async moveFavoriteOffersFromUserToUser(fromUserId: number, toUserId: number) {
    return this.favoriteOffersRepository.update(
      {
        userId: fromUserId,
      },
      {userId: toUserId},
    );
  }

  async addFavoriteOffer(offerId: Offer['id'], userId: number) {
    const isOfferExists = await this.offerRepository.exist({
      where: {
        id: offerId,
      },
    });

    if (isOfferExists) {
      const isExistsInFavorites = await this.favoriteOffersRepository.exist({
        where: {offerId, userId},
      });

      if (isExistsInFavorites) {
        await this.favoriteOffersRepository.delete({offerId, userId});
      } else {
        await this.favoriteOffersRepository.insert({offerId, userId});
      }
    }
  }
}
