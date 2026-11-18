import { PartialType } from '@nestjs/mapped-types';
import { CreateAccessRoleDto, PermissionDto } from './create-access-role.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAccessRoleDto extends PartialType(CreateAccessRoleDto) {
  @ApiProperty({ required: false, type: String, example: 'Stock_clerk' })
  @IsString({ message: 'name must be a string' })
  @IsOptional({ message: 'name must be a string' })
  name?: string;

  @ApiProperty({ required: false, type: String, example: 'Stock clerk' })
  @IsString({ message: 'description must be a string' })
  @IsOptional({
    message: 'description must be a string',
  })
  description?: string;

  @ApiProperty({
    required: false,
    type: [PermissionDto],
    example: [
      { permissionId: '3f09fd34-bb55-4209-96e3-c076d9c053cf' },
      { permissionId: '9045a529-2834-4c30-a163-194bd2ee0808' },
    ],
  })
  permission?: PermissionDto[];
}
