import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { DbPrismaService } from '../config/db-prisma/db-prisma.service';
import * as argon2 from 'argon2';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';

export interface PayloadInterface {
  sub: string;
  organizationId?: string;
  branch_id?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly db: DbPrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private async findUserByEmail(email: string) {
    try {
      return await this.db.user.findUnique({
        where: {
          email: email,
        },
        include: {
          organization: true,
        },
      });
    } catch (error) {
      this.logger.debug(error);
      throw new InternalServerErrorException(
        'internal server error please try after some time',
      );
    }
  }

  private async createHashPassword(password: string): Promise<string> {
    try {
      return await argon2.hash(password);
    } catch (error) {
      this.logger.debug(error);
      throw new InternalServerErrorException(
        'internal server please try to few minutes',
      );
    }
  }

  // create a new organization
  async create(createAuthDto: CreateAuthDto) {
    // check if the email already exists
    const isEmailExist = await this.findUserByEmail(createAuthDto.email);
    if (isEmailExist)
      throw new ConflictException(
        'email already exist please try another email',
      );

    // hashing the password
    createAuthDto.password = await this.createHashPassword(
      createAuthDto.password,
    );

    // create a new role for the organization owner
    const ownerPermission = await this.getOwnerPermission();

    try {
      // create a new organization and User
      const newUser = await this.db.user.create({
        data: {
          email: createAuthDto.email,
          name: createAuthDto.name,
          password: createAuthDto.password,
          role: {
            create: {
              name: 'OWNER',
              description: ownerPermission?.description,
            },
          },
          organization: {
            create: {
              organization_name: createAuthDto.organization_name,
            },
          },
        },
        include: {
          organization: true,
          role: true,
        },
      });
      // userRole create
      await this.db.userRole.create({
        data: {
          userId: newUser.id,
          roleId: newUser.role.id,
        },
      });
      return {
        message: 'organization created successfully',
        data: newUser,
      };
    } catch (error) {
      this.logger.debug(error);
      throw new InternalServerErrorException(
        'internal server error please try after some time',
      );
    }
  }

  // get owner permission
  private async getOwnerPermission() {
    try {
      return await this.db.permission.findFirst({
        where: {
          key: 'owner.all',
        },
      });
    } catch (err) {
      this.logger.debug(err);
      throw new InternalServerErrorException();
    }
  }

  // isPasswordMatch
  private async isPasswordMatch({
    password,
    hashPassword,
  }: {
    password: string;
    hashPassword: string;
  }): Promise<boolean> {
    try {
      return await argon2.verify(hashPassword, password);
    } catch (error) {
      this.logger.debug(error);
      throw new InternalServerErrorException(
        'internal server error please try after some time',
      );
    }
  }

  // login the user
  async login(loginAuthDto: LoginAuthDto) {
    const { email, password } = loginAuthDto;

    // check if the email already exists
    const isEmailExist = await this.findUserByEmail(email);
    if (!isEmailExist) throw new NotFoundException('invalid cadential');

    const { password: hashPassword, ...rest } = isEmailExist;

    // check if the password is correct
    const isPasswordMatch = await this.isPasswordMatch({
      password,
      hashPassword,
    });
    if (!isPasswordMatch) throw new NotFoundException('invalid cadential');

    // prepare the payload for the jwt token
    const { id: sub, name, organization, branch_id } = rest;
    const payload = { sub };
    if (organization && organization.id)
      payload['organizationId'] = organization.id;
    if (branch_id) payload['branch_id'] = branch_id;

    // generate the jwt token and return controller
    try {
      return {
        access_token: `Bearer ${await this.createJwtToken(payload)}`,
        data: {
          name,
          email,
          organization: organization?.organization_name,
        },
      };
    } catch (error) {
      this.logger.debug(error);
      throw new InternalServerErrorException(
        'internal server error please try after some time',
      );
    }
  }

  // create Jwt token
  private async createJwtToken(payload: PayloadInterface) {
    return this.jwtService.signAsync(payload, {
      expiresIn: '6h',
    });
  }
}
