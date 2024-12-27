import {ExecutionContext, Injectable, CanActivate} from '@nestjs/common';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    if (process.env.IS_DEV === 'true') {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    return request.isAuthenticated();
  }
}
