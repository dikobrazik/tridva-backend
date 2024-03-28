import {Test, TestingModule} from '@nestjs/testing';
import {AuthorizationController} from './authorization.controller';
import {AuthorizationService} from './authorization.service';

describe('AuthorizationController', () => {
  const sendCodeMock = jest.fn(() => '1111');

  let controller: AuthorizationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthorizationService],
      controllers: [AuthorizationController],
    })
    .overrideProvider(AuthorizationService)
    .useValue({sendCode: sendCodeMock})
    .compile();

    controller = module.get<AuthorizationController>(AuthorizationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
