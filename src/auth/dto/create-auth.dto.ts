import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { LoginAuthDto } from './login-auth.dto';

export class CreateAuthDto extends LoginAuthDto {
  @ApiProperty({
    required: true,
    type: String,
    example: 'star Innovative Technologies Ince',
    description: 'The organization_name of the organization',
    default: 'star Innovative Technologies Inc',
  })
  @IsString({ message: 'organization_name must be a string' })
  @IsNotEmpty({ message: 'organization_name cannot be empty' })
  organization_name!: string;

  @ApiProperty({
    required: true,
    type: String,
    example: 'Md Sharif',
    description: 'The name of the organization',
    default: 'Md Sharif',
  })
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name cannot be empty' })
  name!: string;
}
