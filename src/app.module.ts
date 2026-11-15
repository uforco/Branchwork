import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DbPrismaModule } from './config/db-prisma/db-prisma.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DbPrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
