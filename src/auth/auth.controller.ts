import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('create-organization')
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('login')
  async login(@Body() loginAuthDto: LoginAuthDto) {
    const { access_token, data } = await this.authService.login(loginAuthDto);
    // jwt access token this not right way to send
    // best practice is to send the token in the httpOnly cookie
    // but for testing purposes we are sending the token in the response
    return {
      access_token,
      data,
    };
  }
}
