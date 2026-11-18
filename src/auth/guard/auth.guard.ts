import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { DbPrismaService } from '../../config/db-prisma/db-prisma.service';
import { PERMISSION_KEY } from './roles.decorator';
import { jwtPayloadInterface } from '../auth.service';
import { Permission } from './role.enum';
import { RbacPermissionCacheService } from '../../lib/rbac-permission-cache/rbac-permission-cache.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly db: DbPrismaService,
    private readonly rbacPermissionCache: RbacPermissionCacheService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    // Get required roles from metadata
    const requiredRoles = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // if no roles are required, allow access Public Access
    if (!requiredRoles) return true;

    // Validate token and extract user info
    // Check if user has required roles
    const token = this.extractBearerToken(request);

    // token checking
    if (token === '') throw new UnauthorizedException();
    const payload = await this.verifyToken<jwtPayloadInterface>(token);

    // push user data to the request object
    await this.userDataPushInterceptor(payload.sub, request);

    //get User API Permisstion
    const userPermission = this.rbacPermissionCache.getData(payload.sub);

    console.log('AuthGurad ==== ', payload.sub, userPermission);

    if (!userPermission) return false;
    return [...requiredRoles, Permission.OWNER_ALL].some(
      (role) => !!userPermission[role],
    );
  }

  // extract bearer token from the authorization header
  private extractBearerToken(req: Request): string {
    const authHeader: string | undefined = req.headers[
      'authorization'
    ] as string;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1] ?? '';
    }
    return '';
  }

  // interceptor to push user data to the request object
  private async userDataPushInterceptor(sub: string, request: Request) {
    // this function will push the user data to the request object
    // important to note ** Bet use to this not right way to db call - best use to cache db  **
    try {
      const user = await this.db.user.findFirst({
        where: { id: sub },
        select: {
          id: true,
          name: true,
          email: true,
          organizationId: true,
          branch_id: true,
          userRole: {
            select: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
      if (!user) throw new UnauthorizedException();
      request['user'] = user;
    } catch (err) {
      this.logger.debug(err);
      throw new UnauthorizedException();
    }
  }

  // verify jwt token
  private async verifyToken<T extends object>(token: string): Promise<T> {
    try {
      return await this.jwtService.verifyAsync<T>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.name !== 'TokenExpiredError' &&
        !error['expiredAt']
      ) {
        this.logger.debug('Gurad Jwt - ', error);
        throw new InternalServerErrorException(
          'Something went wrong!!! Please contact support team',
        );
      }
      throw new UnauthorizedException();
    }
  }
}
