import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
  branch_id: string;
}

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request: Request & { user: unknown } = ctx
      .switchToHttp()
      .getRequest();
    return request.user;
  },
);
