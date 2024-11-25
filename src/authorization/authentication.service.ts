import {BadRequestException, Inject, Injectable} from '@nestjs/common';
// import {getRandomNumber} from 'src/shared/utils/getRandomNumber';
import {SmsService} from 'src/sms/sms.service';

const MINUTE_MS = 60 * 1000;

@Injectable()
export class AuthenticationService {
  @Inject(SmsService)
  private smsService: SmsService;

  private lastSend: Record<string, number> = {};
  private codes: Record<string, string> = {};
  private leftAttempts: Record<string, number> = {};

  public async sendCode(phone: string) {
    const code = '111111'; // String(getRandomNumber(100000, 999999));
    const canResendCode = this.getCanResendCode(phone);

    if (!canResendCode) {
      throw new BadRequestException({
        message: 'Код нельзя запрашивать чаще чем раз в минуту',
        leftSeconds: this.getLeftSeconds(phone),
      });
    }

    this.codes[phone] = code;
    this.leftAttempts[phone] = 3;
    this.lastSend[phone] = new Date().valueOf();

    await this.smsService.sendMessage(
      phone,
      `Tridva. Одноразовый код для доступа к личному кабинету - ${code}`,
    );
  }

  public checkCode(phone: string, code: string): boolean {
    if (this.leftAttempts[phone] === 0) {
      throw new BadRequestException(`Вы истратили все попытки`);
    }

    if (this.codes[phone] !== code) {
      this.leftAttempts[phone] -= 1;

      throw new BadRequestException(
        `Неверный код для номера ${phone}. Осталось попыток: ${this.leftAttempts[phone]}`,
      );
    }

    this.codes[phone] = undefined;
    this.leftAttempts[phone] = 0;
    this.lastSend[phone] = undefined;

    return true;
  }

  private getCanResendCode(phone: string) {
    return this.lastSend[phone] !== undefined
      ? new Date().valueOf() - this.lastSend[phone] >= MINUTE_MS
      : true;
  }

  private getLeftSeconds(phone: string) {
    return 60 - Math.floor((Date.now() - this.lastSend[phone]) / 1000);
  }
}
