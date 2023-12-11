import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from './role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user as { id: string; email: string; role: string };
    if (!this.matchRoles(roles, user.role)) {
      throw new UnauthorizedException();
    }
    return true;
  }

  matchRoles(roles: string[], userRole: string) {
    return roles.includes(userRole);
  }
}
