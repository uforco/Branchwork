import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({
    required: true,
    type: String,
    example: 'Gulshan',
    description: 'this is branch name field',
  })
  @IsString({
    message: 'Branch name must be a string',
  })
  @IsNotEmpty({
    message: 'Branch name can not be empty',
  })
  branch_name!: string;

  @ApiProperty({
    required: true,
    type: String,
    example: 'Dhaka',
    description: 'this is branch location field',
  })
  @IsString({
    message: 'City must be a string',
  })
  @IsNotEmpty({
    message: 'City can not be empty',
  })
  city!: string;
}

export class CreateBranchDtoData extends CreateBranchDto {
  @ApiProperty({
    required: true,
    type: String,
    example: 'decb468a-fa47-477b-9256-7c0cb75cf993',
    description: 'this is organization id field',
  })
  @IsNotEmpty({
    message: 'Organization id can not be empty',
  })
  @IsString({
    message: 'Organization id must be a string',
  })
  organizationId!: string;
}
