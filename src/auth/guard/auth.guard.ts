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
import { Role } from './role.enum';
import { ROLES_KEY } from './roles.decorator';
import { jwtPayloadInterface } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly db: DbPrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    // Get required roles from metadata
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

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

    return true;
    // return requiredRoles.some((role) => payload.role?.includes(role));
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
          role: true,
          organizationId: true,
          branch_id: true,
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
