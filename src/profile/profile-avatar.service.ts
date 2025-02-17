import {Inject, Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {InjectRepository} from '@nestjs/typeorm';
import {Profile} from 'src/entities/Profile';
import {ObjectStorageService} from 'src/object-storage/object-storage.service';
import {Repository} from 'typeorm';

@Injectable()
export class ProfileAvatarService {
  @InjectRepository(Profile)
  private profileRepository: Repository<Profile>;

  @Inject(ConfigService)
  private configService: ConfigService;
  @Inject(ObjectStorageService)
  private objectStorage: ObjectStorageService;

  private profileAvatarHashMap = new Map<number, string>();

  public async getProfileAvatarHash(userId: number): Promise<string> {
    if (this.profileAvatarHashMap.has(userId)) {
      return this.profileAvatarHashMap.get(userId);
    }

    const {avatarHash} = await this.profileRepository.findOne({
      select: {id: true, avatarHash: true},
      where: {id: userId},
    });

    this.profileAvatarHashMap.set(userId, avatarHash);

    return avatarHash;
  }

  public async updateProfileAvatar(userId: number, file: Express.Multer.File) {
    const bucketName = this.configService.getOrThrow('AVATARS_BUCKET_NAME');

    const key = await this.objectStorage.putObject(bucketName, file);

    const avatarHash = await this.getProfileAvatarHash(userId);

    if (avatarHash) {
      await this.objectStorage.deleteObject(bucketName, avatarHash);
    }

    await this.setProfileAvatarHash(userId, key);

    return key;
  }

  private async setProfileAvatarHash(
    userId: number,
    avatarHash: string,
  ): Promise<void> {
    this.profileAvatarHashMap.set(userId, avatarHash);
    await this.profileRepository.update({id: userId}, {avatarHash});
  }
}
