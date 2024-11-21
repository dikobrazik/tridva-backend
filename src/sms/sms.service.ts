import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {SmsAero} from 'smsaero';

@Injectable()
export class SmsService {
  private client: SmsAero;

  constructor(private configService: ConfigService) {
    const email = this.configService.getOrThrow('SMS_EMAIL');
    const apiKey = this.configService.getOrThrow('SMS_API_KEY');

    this.client = new SmsAero(email, apiKey);
  }

  public sendMessage(phone: string, text: string) {
    return Promise.resolve();
    return this.client.send(phone, text);
  }
}
