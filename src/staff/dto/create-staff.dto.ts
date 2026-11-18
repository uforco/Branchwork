import { ApiProperty } from '@nestjs/swagger';
import { LoginAuthDto } from '../../auth/dto/login-auth.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStaffDto extends LoginAuthDto {
  @ApiProperty({
    required: true,
    type: String,
    example: 'Md Meraj',
    description: 'The name of the user name',
  })
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name cannot be empty' })
  name!: string;

  @ApiProperty({
    required: true,
    type: String,
    example: 'branch_uuid',
    description: 'The branch of the branch_uuid',
  })
  @IsString({ message: 'branch_uuid must be a string' })
  @IsNotEmpty({ message: 'branch_uuid cannot be empty' })
  branch_id!: string;

  @ApiProperty({
    required: true,
    type: String,
    example: 'roleId_uuid',
    description: 'The role of the role_uuid',
  })
  @IsString({ message: 'roleId_uuid must be a string' })
  @IsNotEmpty({ message: 'roleId_uuid cannot be empty' })
  roleId!: string;
}
