// node_modules/smsaero/smsaero.js

declare module 'smsaero' {
  export class SmsAero {
    constructor(
      email: any,
      apiKey: any,
      signature?: string,
      gateURLs?: string[],
      typeSend?: number,
    );
    email: any;
    apiKey: any;
    gateURLs: string[];
    proto: string;
    currentURLIndex: number;
    signature: string;
    typeSend: number;
    session: any;
    get currentURLGate(): string;
    send(
      number: any,
      text: any,
      dateSend?: any,
      callbackUrl?: any,
    ): Promise<any>;
    smsStatus(smsId: any): Promise<any>;
    smsList(number?: any, text?: any, page?: any): Promise<any>;
    balance(): Promise<any>;
    auth(): Promise<any>;
    cards(): Promise<any>;
    addBalance(sum: any, cardId: any): Promise<any>;
    tariffs(): Promise<any>;
    signAdd(name: any): Promise<any>;
    signList(page?: any): Promise<any>;
    groupAdd(name: any): Promise<any>;
    groupDelete(groupId: any): Promise<any>;
    groupList(page?: any): Promise<any>;
    contactAdd(
      number: any,
      groupId?: any,
      birthday?: any,
      sex?: any,
      lname?: any,
      fname?: any,
      sname?: any,
      param1?: any,
      param2?: any,
      param3?: any,
    ): Promise<any>;
    contactDelete(contactId: any): Promise<any>;
    contactList(
      number?: any,
      groupId?: any,
      birthday?: any,
      sex?: any,
      operator?: any,
      lname?: any,
      fname?: any,
      sname?: any,
      page?: any,
    ): Promise<any>;
    blacklistAdd(number: any): Promise<any>;
    blacklistList(number?: any, page?: any): Promise<any>;
    blacklistDelete(blacklistId: any): Promise<any>;
    hlrCheck(number: any): Promise<any>;
    hlrStatus(hlrId: any): Promise<any>;
    numberOperator(number: any): Promise<any>;
    viberSend(
      sign: any,
      channel: any,
      text: any,
      number?: any,
      groupId?: any,
      imageSource?: any,
      textButton?: any,
      linkButton?: any,
      dateSend?: any,
      signSms?: any,
      channelSms?: any,
      textSms?: any,
      priceSms?: any,
    ): Promise<any>;
    viberSignList(): Promise<any>;
    viberList(page?: any): Promise<any>;
    flashcallSend(number: any, code: any): Promise<any>;
    flashcallList(number?: any, text?: any, page?: any): Promise<any>;
    flashcallStatus(pk: any): Promise<any>;
  }
  export class SmsAeroError extends Error {
    constructor(message: any);
  }
  export class SmsAeroHTTPError extends SmsAeroError {}
}
