import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    required: true,
    type: String,
    example: 'iPhone 16 Pro',
    description: 'Product name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  product_name!: string;

  @ApiProperty({
    required: true,
    type: String,
    example: 'IPHONE-16-PRO',
    description: 'Unique product SKU',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  sku!: string;

  @ApiProperty({
    required: true,
    type: String,
    example: 'Electronics',
    description: 'Product category',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  categury!: string;

  @ApiProperty({
    required: true,
    type: Number,
    example: 999.99,
    description: 'Product price (must be non-negative)',
    minimum: 0,
    default: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiProperty({
    required: true,
    type: Number,
    example: 100,
    description: 'Available product stock (must be non-negative)',
    minimum: 0,
    default: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  stock!: number;

  @ApiProperty({
    required: true,
    type: String,
    example: 'uuid',
    description: 'branch uuid',
  })
  @IsString()
  @IsNotEmpty()
  branchId!: string;
}
