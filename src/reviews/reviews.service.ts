import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Review} from 'src/entities/Review';
import {Repository} from 'typeorm';

@Injectable()
export class ReviewsService {
  @InjectRepository(Review)
  private reviewRepository: Repository<Review>;

  public createReview(authorId: number, offerId: number, text: string) {
    return this.reviewRepository.insert({
      offerId,
      text,
      authorId,
    });
  }

  public getReviews(offerId: number) {
    return this.reviewRepository.find({
      where: {offerId},
    });
  }
}
