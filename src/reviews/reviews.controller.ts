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
import {CreateReviewDto, GetReviewsDto, GetReviewsTotalDto} from './dto';
import {AuthGuard} from 'src/guards/auth.guard';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @UseGuards(AuthGuard)
  @Post()
  public createReview(
    @Request() request: AuthorizedRequest,
    @Body() body: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(request.userId, body);
  }

  @Get(':offerId')
  public getReviews(@Param() params: GetReviewsDto) {
    return this.reviewsService.getReviews(params);
  }

  @Get(':offerId/total')
  public getReviewCount(@Param() params: GetReviewsTotalDto) {
    return this.reviewsService.getReviewsCount(params.offerId);
  }

  @Get(':offerId/average')
  public getReviewAverage(@Param() params: GetReviewsTotalDto) {
    return this.reviewsService.getReviewsAvg(params.offerId);
  }
}
