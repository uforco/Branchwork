import { PartialType } from '@nestjs/mapped-types';
import { CreateBranchDto, CreateBranchDtoData } from './create-branch.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateBranchDto extends PartialType(CreateBranchDto) {
  @ApiProperty({
    required: false,
    type: String,
    example: 'Gulshan',
    description: 'this is branch name field',
  })
  @IsString({
    message: 'Branch name must be a string',
  })
  @IsOptional({
    message: 'Branch name can not be empty',
  })
  branch_name?: string;

  @ApiProperty({
    required: false,
    type: String,
    example: 'Dhaka',
    description: 'this is branch location field',
  })
  @IsString({
    message: 'City must be a string',
  })
  @IsOptional({
    message: 'City can not be empty',
  })
  city?: string;
}
export class UpdateBranchDtoData extends PartialType(CreateBranchDtoData) {}
