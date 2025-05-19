import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CoordinatesDto {
  @ApiProperty({ description: 'Latitude of the location', example: -1.2921 })
  @IsNumber()
  lat: number;

  @ApiProperty({ description: 'Longitude of the location', example: 36.8219 })
  @IsNumber()
  lng: number;
}

export class CreateLocationDto {
  @ApiProperty({ description: 'Name of the location', example: 'Nairobi North Site' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'County where the location is located', example: 'Nairobi' })
  @IsString()
  @IsNotEmpty()
  county: string;

  @ApiProperty({ description: 'Address of the location', example: '123 Solar Lane, Nairobi North', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ type: CoordinatesDto, required: false, description: 'Coordinates of the location' })
  @ValidateNested()
  @Type(() => CoordinatesDto)
  @IsOptional()
  coordinates?: CoordinatesDto;
}

export class UpdateLocationDto {
  @ApiProperty({ description: 'Name of the location', example: 'Nairobi North Site', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'County where the location is located', example: 'Nairobi', required: false })
  @IsString()
  @IsOptional()
  county?: string;

  @ApiProperty({ description: 'Address of the location', example: '123 Solar Lane, Nairobi North', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ type: CoordinatesDto, required: false, description: 'Coordinates of the location' })
  @ValidateNested()
  @Type(() => CoordinatesDto)
  @IsOptional()
  coordinates?: CoordinatesDto;
}
