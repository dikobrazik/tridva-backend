import {AxiosInstance} from 'axios';
import {getRandomNumber} from 'src/shared/utils/getRandomNumber';
import {IapiReviewsResponse} from './types';

export class SimaIapi {
  constructor(private client: AxiosInstance) {}

  public loadOfferReviews(simaid: number) {
    let retriesLeft = 4;

    const load = async (): Promise<IapiReviewsResponse['items']> => {
      try {
        const r = await this.client<IapiReviewsResponse>(
          `/reviews/v1/goods/${simaid}/list?sort=rating&page=1&perPage=${getRandomNumber(
            20,
            40,
          )}`,
        );

        return r.data.items;
      } catch (e) {
        console.error(e);
        await new Promise((resolve, reject) =>
          retriesLeft-- === 0
            ? reject(e)
            : setTimeout(resolve, 10000 * (4 - retriesLeft)),
        );
        return await load();
      }
    };

    return load();
  }
}
