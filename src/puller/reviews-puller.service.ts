/* eslint-disable no-console */
import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {InjectRepository} from '@nestjs/typeorm';
import axios, {AxiosInstance} from 'axios';
import {Offer} from 'src/entities/Offer';
import {Review} from 'src/entities/Review';
import {User} from 'src/entities/User';
import {IsNull, LessThan, Not, Repository} from 'typeorm';
import {SimaIapi} from './api/SimaIapi';
import {IapiReviewItem} from './api/SimaIapi/types';
import {ReviewPhoto} from 'src/entities/ReviewPhoto';

@Injectable()
export class ReviewsPullerService {
  @InjectRepository(Offer)
  private offerRepository: Repository<Offer>;
  @InjectRepository(Review)
  private reviewRepository: Repository<Review>;
  @InjectRepository(ReviewPhoto)
  private reviewPhotoRepository: Repository<ReviewPhoto>;
  @InjectRepository(User)
  private userRepository: Repository<User>;

  private simaIapi: SimaIapi;
  private simaIapiClient: AxiosInstance;

  private simaUsersMap = new Map<number, number>();

  constructor(private configService: ConfigService) {
    this.simaIapiClient = axios.create({
      baseURL: this.configService.getOrThrow('SIMA_IAPI_URL'),
    });
    this.simaIapiClient.defaults.headers.get.cookie = 'lol';
    this.simaIapiClient.defaults.headers.common['User-Agent'] =
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36';

    this.simaIapi = new SimaIapi(this.simaIapiClient);
  }

  async fillReviews() {
    await this.fillReviewsAuthors();

    const offers = await this.offerRepository
      .find({
        select: {id: true, simaid: true},
        loadEagerRelations: false,
        where: {reviewsCount: LessThan(10)},
      })
      .then((offers) => offers.slice(1, 2));

    for (const offer of offers) {
      const simaReviews = await this.simaIapi.loadOfferReviews(offer.simaid);

      await this.saveReviewsAuthors(simaReviews);

      for (const simaReview of simaReviews) {
        const review = await this.reviewRepository.save({
          offerId: offer.id,
          authorId: this.simaUsersMap.get(simaReview.userId),
          rating: simaReview.rating.value,
          text: simaReview.text,
          createdAt: simaReview.date,
        });

        if (simaReview.photos && simaReview.photos.length) {
          this.reviewPhotoRepository.save(
            simaReview.photos.map((simaReviewPhoto) => ({
              id: simaReviewPhoto.id,
              src: simaReviewPhoto.src,
              reviewId: review.id,
            })),
          );
        }
      }
    }
  }

  private async fillReviewsAuthors() {
    const simaUsers = await this.userRepository.find({
      select: {id: true, simaid: true},
      where: {simaid: Not(IsNull())},
    });

    for (const user of simaUsers) {
      this.simaUsersMap.set(user.simaid, user.id);
    }
  }

  private async saveReviewsAuthors(reviews: IapiReviewItem[]) {
    console.log(reviews);
    for (const review of reviews) {
      if (!this.simaUsersMap.has(review.userId)) {
        const user = await this.userRepository.save({
          simaid: review.userId,
          profile: {name: review.author},
        });

        this.simaUsersMap.set(review.userId, user.id);
      }
    }
  }
}
