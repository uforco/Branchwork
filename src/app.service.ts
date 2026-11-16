import { Injectable } from '@nestjs/common';
import { DbPrismaService } from './config/db-prisma/db-prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: DbPrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users;
  }
}
