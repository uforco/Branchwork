import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Permissions } from './auth/guard/roles.decorator';
import { Permission } from './auth/guard/role.enum';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Permissions(Permission.USER_READ)
  @Get('users')
  getAllUsers() {
    return this.appService.findAll();
  }
}
