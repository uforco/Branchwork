import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class PermissionDto {
  @ApiProperty({
    required: true,
    type: String,
    example: '3f09fd34-bb55-4209-96e3-c076d9c053cf',
  })
  @IsUUID('4', { message: 'permission id must be a valid UUID' })
  permissionId!: string;
}

export class CreateAccessRoleDto {
  @ApiProperty({ required: true, type: String, example: 'Stock_clerk' })
  @IsString({ message: 'name must be a string' })
  name!: string;

  @ApiProperty({ required: false, type: String, example: 'Stock clerk' })
  @IsString({ message: 'description must be a string' })
  @IsOptional({
    message: 'description must be a string',
  })
  description?: string;

  @ApiProperty({
    required: true,
    type: [PermissionDto],
    example: [
      { permissionId: '3f09fd34-bb55-4209-96e3-c076d9c053cf' },
      { permissionId: '9045a529-2834-4c30-a163-194bd2ee0808' },
    ],
  })
  permission!: PermissionDto[];
}
