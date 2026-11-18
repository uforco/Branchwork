import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  organizationId: string;
  branch_id: string;
  userRole: { role: { name: string } };
};

export const User = createParamDecorator(
  (_data: string, ctx: ExecutionContext) => {
    const request: Request & { user?: AuthUser } = ctx
      .switchToHttp()
      .getRequest();
    if (_data) return request.user?.[_data as keyof AuthUser];
    return request.user;
  },
);
