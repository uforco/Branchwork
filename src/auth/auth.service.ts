import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { DbPrismaService } from '../config/db-prisma/db-prisma.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { EncryptedPasswordService } from '../lib/encrypted-password/encrypted-password.service';

export interface jwtPayloadInterface {
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
    private readonly encryptedPassword: EncryptedPasswordService,
  ) {}

  private async findUserByEmail(email: string) {
    try {
      return await this.db.user.findUnique({
        where: {
          email: email,
        },
        include: {
          organization: true,
          userRole: {
            select: {
              role: {
                select: {
                  rolePermission: {
                    select: {
                      permission: {
                        select: {
                          key: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
    } catch (error) {
      this.logger.debug(error);
      throw new InternalServerErrorException(
        'internal server error please try after some time',
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
    createAuthDto.password = await this.encryptedPassword.getHash(
      createAuthDto.password,
    );
    // create a new role for the organization owner
    const ownerPermission = await this.getOwnerPermission();
    if (!ownerPermission)
      throw new InternalServerErrorException('owner permission not found');
    /*
      create 
    */

    try {
      const newUserData = await this.db.$transaction(async (tx) => {
        // create a new organization and User
        const newUser = await tx.user.create({
          data: {
            email: createAuthDto.email,
            name: createAuthDto.name,
            password: createAuthDto.password,
            organization: {
              create: {
                organization_name: createAuthDto.organization_name,
              },
            },
          },
          include: {
            organization: true,
          },
        });
        // create role with permission, then assign to user via UserRole
        const newRole = await tx.role.create({
          data: {
            name: 'OWNER',
            userId: newUser.id,
            description: ownerPermission.description,
            rolePermission: {
              create: { permissionId: ownerPermission.id },
            },
          },
        });
        const userRole = await tx.userRole.create({
          data: {
            userId: newUser.id,
            roleId: newRole.id,
          },
          include: {
            role: {
              include: {
                rolePermission: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        });
        return { ...newUser, userRole };
      });

      return {
        message: 'organization created successfully',
        data: newUserData,
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

  // login the user
  async login(loginAuthDto: LoginAuthDto) {
    const { email, password } = loginAuthDto;

    // check if the email already exists - best way Bloom filter time complex O(k)/O(1)
    const isEmailExist = await this.findUserByEmail(email);
    if (!isEmailExist) throw new NotFoundException('invalid cadential');

    const { password: hashPassword, ...rest } = isEmailExist;

    // check if the password is correct
    const isPasswordMatch = await this.encryptedPassword.verifyHash({
      password,
      hash: hashPassword,
    });
    if (!isPasswordMatch) throw new NotFoundException('invalid cadential');

    console.log(isEmailExist);

    // prepare the payload for the jwt token
    const { id: sub, organization, branch_id } = rest;
    const payload = { sub };
    if (organization && organization.id)
      payload['organizationId'] = organization.id;
    if (branch_id) payload['branch_id'] = branch_id;

    // generate the jwt token and return controller
    try {
      return {
        access_token: '', //`Bearer ${await this.createJwtToken(payload)}`,
        data: isEmailExist,
      };
    } catch (error) {
      this.logger.debug(error);
      throw new InternalServerErrorException(
        'internal server error please try after some time',
      );
    }
  }

  // create Jwt token
  private async createJwtToken(payload: jwtPayloadInterface) {
    return this.jwtService.signAsync(payload, {
      expiresIn: '6h',
    });
  }
}
