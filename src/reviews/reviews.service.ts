import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Review} from 'src/entities/Review';
import {Repository} from 'typeorm';
import {CreateReviewDto, GetReviewsDto} from './dto';
import {getPaginationFields} from 'src/shared/utils/pagination';

@Injectable()
export class ReviewsService {
  @InjectRepository(Review)
  private reviewRepository: Repository<Review>;

  public createReview(authorId: number, review: CreateReviewDto) {
    return this.reviewRepository.insert({
      offerId: review.offerId,
      text: review.text,
      author: {id: authorId},
      rating: review.rating,
    });
  }

  public getReviews(params: GetReviewsDto) {
    return this.reviewRepository
      .find({
        ...getPaginationFields(params.page, params.pageSize),
        relations: {
          author: {
            profile: true,
          },
        },
        where: {offerId: params.offerId},
      })
      .then((reviews) =>
        reviews.map(({author, ...review}) => ({
          ...review,
          authorName: author.profile.name,
        })),
      );
  }

  public getReviewsAvg(offerId: number) {
    return this.reviewRepository
      .createQueryBuilder('reviews')
      .select('AVG(reviews.rating)', 'avgRating')
      .where(`reviews.offerId = ${offerId}`)
      .getRawOne()
      .then((value) => {
        return value.avgRating === null
          ? 0
          : parseFloat(value.avgRating).toFixed(2);
      });
  }

  public getReviewsCount(offerId: number) {
    return this.reviewRepository.count({
      where: {offerId},
    });
  }
}
