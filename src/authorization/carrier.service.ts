import {Injectable, InternalServerErrorException} from '@nestjs/common';
import {InjectDataSource, InjectRepository} from '@nestjs/typeorm';
import {BasketItem} from 'src/entities/BasketItem';
import {FavoriteOffer} from 'src/entities/FavoriteOffer';
import {Group} from 'src/entities/Group';
import {User} from 'src/entities/User';
import {DataSource, QueryRunner, Repository} from 'typeorm';

@Injectable()
export class CarrierService {
  @InjectRepository(User)
  private userRepository: Repository<User>;

  @InjectDataSource()
  private dataSource: DataSource;

  public async moveUser(fromUserId: number, toUserId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      await this.transferUserStuff(queryRunner, fromUserId, toUserId);
      await this.userRepository.delete(fromUserId);

      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();

      throw new InternalServerErrorException(
        'Something went wrong while moving user stuff',
        e,
      );
    } finally {
      await queryRunner.release();
    }
  }

  public async transferUserStuff(
    queryRunner: QueryRunner,
    fromUserId: number,
    toUserId: number,
  ) {
    await queryRunner.manager.update(
      BasketItem,
      {userId: fromUserId},
      {
        userId: toUserId,
      },
    );

    await queryRunner.manager.update(
      Group,
      {ownerId: fromUserId},
      {
        ownerId: toUserId,
      },
    );
    await queryRunner.manager.update(
      FavoriteOffer,
      {
        userId: fromUserId,
      },
      {userId: toUserId},
    );
  }
}
