import {Injectable} from '@nestjs/common';
import {AuthorizationService} from 'src/authorization/authorization.service';
import {OffersService} from 'src/offers/offers.service';

@Injectable()
export class SeedService {
  public constructor(
    private readonly authService: AuthorizationService,
    private readonly offersService: OffersService,
  ) {}

  public async seed() {
    // console.log(await this.authService.signUp('user1', 'useruser'));

    // await this.offersService.seed();
  }
}
