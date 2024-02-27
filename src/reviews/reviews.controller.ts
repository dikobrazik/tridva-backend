import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {ReviewsService} from './reviews.service';
import {AuthorizedRequest} from 'src/shared/types';
import {
  CreateReviewDto,
  CreateReviewParamsDto,
  GetReviewsDto,
  GetReviewsTotalDto,
} from './dto';
import {AuthGuard} from 'src/guards/auth.guard';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('reviews')
@Controller('offers')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @UseGuards(AuthGuard)
  @Post(':offerId/reviews')
  public createReview(
    @Request() request: AuthorizedRequest,
    @Body() body: CreateReviewDto,
    @Param() params: CreateReviewParamsDto,
  ) {
    return this.reviewsService.createReview(request.userId, body, params);
  }

  @Get(':offerId/reviews')
  public getReviews(@Param() params: GetReviewsDto) {
    return this.reviewsService.getReviews(params);
  }

  @Get(':offerId/reviews/total')
  public getReviewCount(@Param() params: GetReviewsTotalDto) {
    return this.reviewsService.getReviewsCount(params.offerId);
  }

  @Get(':offerId/reviews/average')
  public getReviewAverage(@Param() params: GetReviewsTotalDto) {
    return this.reviewsService.getReviewsAvg(params.offerId);
  }
}
