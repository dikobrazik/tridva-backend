import {Injectable, InternalServerErrorException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import axios, {AxiosInstance} from 'axios';
import {generateTokenFromBody} from './utils';
import {CancelResponse, GetQrResponse, InitResponse} from './types';

@Injectable()
export class KassaService {
  private client: AxiosInstance;

  private baseUrl: string;
  private terminalKey: string;
  private password: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.getOrThrow('KASSA_BASE_URL');
    this.terminalKey = this.configService.getOrThrow('KASSA_TERMINAL_KEY');
    this.password = this.configService.getOrThrow('KASSA_PASSWORD');

    this.client = axios.create({baseURL: this.baseUrl});
  }

  // https://www.tbank.ru/kassa/dev/payments/#tag/SBP/operation/GetQr
  public async getQrCode(): Promise<GetQrResponse> {
    const payment = await this.initPayment(1, 100);

    const body = this.prepareBody({
      TerminalKey: this.terminalKey,
      PaymentId: payment.PaymentId,
      DataType: 'PAYLOAD',
    });

    const response = await this.client
      .post<GetQrResponse>('/Init', body)
      .then((r) => r.data);

    console.log('GetQr response', response);

    if (!response.Success) {
      throw new InternalServerErrorException();
    }

    return response;
  }

  // https://www.tbank.ru/kassa/dev/payments/#tag/Standartnyj-platezh/operation/Init
  public async initPayment(
    orderId: number,
    amount: number,
  ): Promise<InitResponse> {
    const body: Record<string, any> = this.prepareBody({
      TerminalKey: this.terminalKey,
      Amount: amount,
      OrderId: String(orderId),
      Description: 'Tridva.',
      // CustomerKey: '<string>',
      // Recurrent: '<string>',
      PayType: 'O',
      Language: 'ru',
      // NotificationURL: '<uri>',
      SuccessURL: 'https://tridva.store/basket/checkout/success',
      // FailURL: '<uri>',
      // RedirectDueDate: new Date(Date.now() + 30 * 60_000).toJSON(),
      DATA: {
        // QR: true,
      },
      // Receipt: {
      //   Items: [
      //     {
      //       Name: '<string>',
      //       Price: '<number>',
      //       Quantity: '<number>',
      //       Amount: '<number>',
      //       Tax: 'none',
      //       PaymentMethod: 'full_payment',
      //       PaymentObject: 'commodity',
      //       Ean13: '<string>',
      //       ShopCode: '<string>',
      //       AgentData: {
      //         AgentSign: '<string>',
      //         OperationName: '<string>',
      //         Phones: ['<string>', '<string>'],
      //         ReceiverPhones: ['volup', 'velit elit'],
      //         TransferPhones: ['nulla min', 'in ad'],
      //         OperatorName: '<string>',
      //         OperatorAddress: '<string>',
      //         OperatorInn: '<string>',
      //       },
      //       SupplierInfo: {
      //         Phones: ['<string>', '<string>'],
      //         Name: '<string>',
      //         Inn: '<string>',
      //       },
      //     },
      //     {
      //       Name: '<string>',
      //       Price: '<number>',
      //       Quantity: '<number>',
      //       Amount: '<number>',
      //       Tax: 'vat120',
      //       PaymentMethod: 'full_payment',
      //       PaymentObject: 'commodity',
      //       Ean13: '<string>',
      //       ShopCode: '<string>',
      //       AgentData: {
      //         AgentSign: '<string>',
      //         OperationName: '<string>',
      //         Phones: ['<string>', '<string>'],
      //         ReceiverPhones: ['Lorem quis', 'tempor nulla'],
      //         TransferPhones: ['irure aliqua', 'fugiat exe'],
      //         OperatorName: '<string>',
      //         OperatorAddress: '<string>',
      //         OperatorInn: '<string>',
      //       },
      //       SupplierInfo: {
      //         Phones: ['<string>', '<string>'],
      //         Name: '<string>',
      //         Inn: '<string>',
      //       },
      //     },
      //   ],
      //   Taxation: 'usn_income',
      //   FfdVersion: '1.05',
      //   Email: '<email>',
      //   Phone: '<string>',
      //   Payments: {
      //     Electronic: '<number>',
      //     Cash: '<number>',
      //     AdvancePayment: '<number>',
      //     Credit: '<number>',
      //     Provision: '<number>',
      //   },
      // },
      // Shops: [
      //   {
      //     ShopCode: '<string>',
      //     Amount: '<number>',
      //     Name: '<string>',
      //     Fee: '<string>',
      //   },
      //   {
      //     ShopCode: '<string>',
      //     Amount: '<number>',
      //     Name: '<string>',
      //     Fee: '<string>',
      //   },
      // ],
      // Descriptor: '<string>',
    });

    const response = await this.client
      .post<InitResponse>('/Init', body)
      .then((r) => r.data);

    console.log('Init response', body, response);

    if (!response.Success) {
      throw new InternalServerErrorException();
    }

    return response;
  }

  public async cancelPayment(
    paymentId: string,
    amount: number,
  ): Promise<CancelResponse> {
    const body: Record<string, any> = this.prepareBody({
      TerminalKey: this.terminalKey,
      PaymentId: paymentId,
      Amount: amount,
      // Receipt: {
      //   FfdVersion: 'string',
      //   ClientInfo: {
      //     Birthdate: 'string',
      //     Citizenship: 'string',
      //     DocumentСode: '21',
      //     DocumentData: 'string',
      //     Address: 'string',
      //   },
      //   Taxation: 'osn',
      //   Email: 'a@test.ru',
      //   Phone: '+79031234567',
      //   Customer: '78894325',
      //   CustomerInn: '788621292',
      //   Items: [
      //     {
      //       AgentData: {
      //         AgentSign: 'paying_agent',
      //         OperationName: 'Позиция чека',
      //         Phones: ['+790912312398'],
      //         ReceiverPhones: ['+79221210697', '+79098561231'],
      //         TransferPhones: ['+79221210697'],
      //         OperatorName: 'Tinkoff',
      //         OperatorAddress: 'г. Тольятти',
      //         OperatorInn: '7710140679',
      //       },
      //       SupplierInfo: {
      //         Phones: ['+79221210697', '+79098561231'],
      //         Name: 'ООО Вендор товара',
      //         Inn: '7710140679',
      //       },
      //       Name: 'Наименование товара 1',
      //       Price: 10000,
      //       Quantity: 1,
      //       Amount: 10000,
      //       Tax: 'vat10',
      //       PaymentMethod: 'full_payment',
      //       PaymentObject: 'goods_with_marking_code',
      //       UserData: 'Данные пользователя ext.test.qa@tinkoff.ru',
      //       Excise: '12.2',
      //       CountryCode: '056',
      //       DeclarationNumber: '12345678901',
      //       MeasurementUnit: 'шт',
      //       MarkProcessingMode: 'string',
      //       MarkCode: {
      //         MarkCodeType: 'EAN8',
      //         Value: '12345678',
      //       },
      //       MarkQuantity: {
      //         Numerator: 1,
      //         Denominator: 2,
      //       },
      //       SectoralItemProps: {
      //         FederalId: '001',
      //         Date: '21.11.2020',
      //         Number: '123/43',
      //         Value: 'test value SectoralItemProps',
      //       },
      //     },
      //   ],
      //   Payments: {
      //     Cash: 90000,
      //     Electronic: 50000,
      //     AdvancePayment: 0,
      //     Credit: 0,
      //     Provision: 0,
      //   },
      // },
      // Shops: [
      //   {
      //     ShopCode: '700456',
      //     Amount: 10000,
      //     Name: 'Товар',
      //   },
      // ],
      // QrMemberId: '77892',
      // Route: 'BNPL',
      // Source: 'BNPL',
      // ExternalRequestId: 'string',
    });

    const response = await this.client
      .post<CancelResponse>('/Cancel', body)
      .then((r) => r.data);

    console.log('Cancel response', response);

    if (!response.Success) {
      throw new InternalServerErrorException();
    }

    return response;
  }

  private prepareBody<Body extends Record<string, any>>(
    body: Body,
  ): Body & {Token: string} {
    return {
      ...body,
      Token: generateTokenFromBody(body, this.password),
    };
  }

  public checkToken<Body extends Record<string, any>>(body: Body): boolean {
    const {Token, ...bodyWithoutToken} = body;
    const token = generateTokenFromBody(bodyWithoutToken, this.password);

    return Token === token;
  }
}
