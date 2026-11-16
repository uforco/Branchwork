import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({
    required: true,
    type: String,
    example: 'sitl@gmail.com',
    description: 'The email of the organization',
    default: 'sitl@gmail.com',
  })
  @IsEmail({}, { message: ' must be a valid email' })
  @IsNotEmpty({ message: ' cannot be empty' })
  email!: string;

  @ApiProperty({
    required: true,
    type: String,
    example: '123456789',
    description: 'The organization_password of the organization',
    default: '123456789',
  })
  @IsString({ message: 'password must be a string' })
  @IsNotEmpty({ message: 'password cannot be empty' })
  password!: string;
}
