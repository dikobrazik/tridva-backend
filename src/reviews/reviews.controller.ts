import {Body, Controller, Get, Post, Request, UseGuards} from '@nestjs/common';
import {ReviewsService} from './reviews.service';
import {AuthorizedRequest} from 'src/shared/types';
import {CreateReviewDto, GetReviewsDto} from './dto';
import {AuthGuard} from 'src/guards/auth.guard';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('reviews')
@Controller('reviews')
@UseGuards(AuthGuard)
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post('/create')
  public createReview(
    @Request() request: AuthorizedRequest,
    @Body() body: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(
      request.userId,
      body.offerId,
      body.text,
    );
  }

  @Get()
  public getReviews(@Body() body: GetReviewsDto) {
    return this.reviewsService.getReviews(body.offerId);
  }
}
