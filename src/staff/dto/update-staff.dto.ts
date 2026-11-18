import { PartialType } from '@nestjs/mapped-types';
import { CreateStaffDto } from './create-staff.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateStaffDto extends PartialType(CreateStaffDto) {
  @ApiProperty({
    required: false,
    type: String,
    example: 'Md Meraj',
    description: 'The name of the user name',
  })
  @IsString({ message: 'name must be a string' })
  @IsOptional({ message: 'name cannot be empty' })
  name?: string;

  @ApiProperty({
    required: false,
    type: String,
    example: '123456789',
    description: 'The organization_password of the organization',
    default: '123456789',
  })
  @IsString({ message: 'password must be a string' })
  @IsOptional({ message: 'password cannot be empty' })
  password?: string;

  @ApiProperty({
    required: false,
    type: String,
    example: 'branch_uuid',
    description: 'The branch of the branch_uuid',
  })
  @IsString({ message: 'branch_uuid must be a string' })
  branch_id?: string;

  @ApiProperty({
    required: false,
    type: String,
    example: 'roleId_uuid',
    description: 'The role of the role_uuid',
  })
  @IsString({ message: 'roleId_uuid must be a string' })
  @IsOptional({ message: 'roleId_uuid cannot be empty' })
  roleId?: string;
}
