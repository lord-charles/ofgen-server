import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, ValidateNested, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { SiteType, LocationStatus } from './location.schema';

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

  @ApiProperty({ enum: SiteType, description: 'Type of site: indoor or outdoor', example: SiteType.OUTDOOR })
  @IsEnum(SiteType)
  siteType: SiteType;

  @ApiProperty({ description: 'User-input site ID', example: 'ABC-123', required: false })
  @IsString()
  @IsOptional()
  siteId?: string;

  @ApiProperty({ enum: LocationStatus, description: 'Site status', example: LocationStatus.ACTIVE, required: false })
  @IsEnum(LocationStatus)
  @IsOptional()
  status?: LocationStatus;
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

  @ApiProperty({ enum: SiteType, description: 'Type of site: indoor or outdoor', required: false })
  @IsEnum(SiteType)
  @IsOptional()
  siteType?: SiteType;

  @ApiProperty({ description: 'User-input site ID', example: 'ABC-123', required: false })
  @IsString()
  @IsOptional()
  siteId?: string;

  @ApiProperty({ enum: LocationStatus, description: 'Site status', example: LocationStatus.ACTIVE, required: false })
  @IsEnum(LocationStatus)
  @IsOptional()
  status?: LocationStatus;
}

