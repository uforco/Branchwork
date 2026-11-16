import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '../../../prisma/generated/client';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class DbPrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(DbPrismaService.name);

  constructor(configService: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: configService.get('DATABASE_URL'),
    });
    super({ adapter });
  }
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      // (error);
      this.logger.error(error);
    }
  }
  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (error) {
      // (error);
      this.logger.error(error);
    }
  }
}
