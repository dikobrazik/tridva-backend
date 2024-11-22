/* eslint-disable no-empty */
import {Test, TestingModule} from '@nestjs/testing';
import {AuthenticationService} from '../authorization/authentication.service';
import {SmsService} from 'src/sms/sms.service';
import {ConfigService} from '@nestjs/config';
import {BadRequestException} from '@nestjs/common';
import {getRandomNumber} from 'src/shared/utils/getRandomNumber';

jest.mock('src/shared/utils/getRandomNumber');

jest.useFakeTimers();

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let smsService: SmsService;

  beforeEach(async () => {
    jest.mocked(getRandomNumber).mockReturnValue(999999);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        SmsService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => key),
          },
        },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    smsService = module.get<SmsService>(SmsService);

    jest
      .spyOn(smsService, 'sendMessage')
      .mockImplementation(() => Promise.resolve('sended'));

    jest.clearAllTimers();
  });

  describe('send code', () => {
    it('should send code', async () => {
      await service.sendCode('89393803616');

      expect(smsService.sendMessage).toHaveBeenCalledWith(
        '89393803616',
        `Tridva. Одноразовый код для доступа к личному кабинету - 1234`,
      );
    });

    describe('if code requested more than once in minute', () => {
      it('should throw an error', async () => {
        await service.sendCode('89393803616');

        expect(service.sendCode('89393803616')).rejects.toThrowError(
          new BadRequestException(
            'Код нельзя запрашивать чаще чем раз в минуту',
          ),
        );
      });

      it('should throw an error after 59 seconds', async () => {
        await service.sendCode('89393803616');

        jest.advanceTimersByTime(59_500);

        expect(service.sendCode('89393803616')).rejects.toThrowError(
          new BadRequestException(
            'Код нельзя запрашивать чаще чем раз в минуту',
          ),
        );
      });
    });

    describe('if code requested after one minute', () => {
      it('should not throw an error', async () => {
        await service.sendCode('89393803616');

        jest.advanceTimersByTime(60_000);

        expect(service.sendCode('89393803616')).resolves.toBeUndefined();
      });
    });
  });

  describe('check code', () => {
    beforeEach(async () => {
      await service.sendCode('89393803616');
    });

    describe('if code right', () => {
      it('should return true', async () => {
        expect(service.checkCode('89393803616', '1234')).toEqual(true);
      });
    });

    describe('if code incorrect', () => {
      it('should throw an error', async () => {
        expect(() => service.checkCode('89393803616', '199999')).toThrowError(
          new BadRequestException(
            `Неверный код для номера 89393803616. Осталось попыток: 2`,
          ),
        );
      });
    });

    describe('if max retries count reached', () => {
      beforeEach(async () => {
        try {
          service.checkCode('89393803616', '199999');
        } catch {}
        try {
          service.checkCode('89393803616', '199399');
        } catch {}
        try {
          service.checkCode('89393803616', '199599');
        } catch {}
      });

      it('should throw an error', async () => {
        expect(() => service.checkCode('89393803616', '149999')).toThrowError(
          new BadRequestException(`Вы истратили все попытки`),
        );
      });

      it('can send new code after one minute', async () => {
        jest.advanceTimersByTime(60_000);

        expect(service.sendCode('89393803616')).resolves.not.toThrow();
      });
    });
  });
});
