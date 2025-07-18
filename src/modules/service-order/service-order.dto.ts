import {
  IsString,
  IsOptional,
  IsObject,
  IsArray,
  ValidateNested,
  IsEnum,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactInfoDto {
  @ApiProperty({ example: 'Cyrus Kamau Wanyoike' })
  @IsString()
  name: string;

  @ApiProperty({ example: '0722218127' })
  @IsString()
  telephone: string;

  @ApiProperty({ example: 'CWanyoike1@Safaricom.co.ke' })
  @IsString()
  email: string;

  @ApiProperty({ example: 'SAFARICOM HQ III' })
  @IsString()
  physicalAddress: string;
}

export class CreateLocationInfoDto {
  @ApiProperty({ example: 'RIFT VALLEY' })
  @IsString()
  region: string;

  @ApiProperty({ example: 'NAKURU' })
  @IsString()
  subRegion: string;

  @ApiProperty({
    example: { latitude: -0.81279, longitude: 36.39084 },
    type: 'object',
    properties: {
      latitude: { type: 'number', example: -0.81279 },
      longitude: { type: 'number', example: 36.39084 },
    },
    additionalProperties: false,
  })
  @IsObject()
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export class CreateSiteDetailsDto {
  @ApiProperty({ example: '13632_RV_NO1029-Longonot_Farm_OUTN_MGF' })
  @IsString()
  siteId: string;

  @ApiPropertyOptional({ example: 'Green Field' })
  @IsOptional()
  @IsString()
  siteType?: string;

  @ApiPropertyOptional({ example: 'Last Mile' })
  @IsOptional()
  @IsString()
  siteClassification?: string;
}

export class CreateBillOfMaterialsItemDto {
  @ApiProperty({ example: 'Li Battery Capacity (Ah)' })
  @IsString()
  item: string;

  @ApiProperty({ example: 'Equipment' })
  @IsString()
  bomType: 'Equipment' | 'Service';

  @ApiProperty({ example: '100AH' })
  @IsString()
  specs: string;

  @ApiProperty({ example: 'Pcs' })
  @IsString()
  unitOfMeasure: string;

  @ApiProperty({ example: 7 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rate?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  total?: number;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateServiceOrderDto {
  @ApiProperty({ example: 'SAFARICOM PLC' })
  @IsString()
  issuedBy: string;

  @ApiProperty({ example: 'OFGEN Limited' })
  @IsString()
  issuedTo: string;

  @ApiProperty({ example: '2025-02-04' })
  @IsDateString()
  serviceOrderDate: string;

  @ApiProperty({
    type: CreateContactInfoDto,
    example: {
      name: 'Cyrus Kamau Wanyoike',
      telephone: '0722218127',
      email: 'CWanyoike1@Safaricom.co.ke',
      physicalAddress: 'SAFARICOM HQ III',
    },
  })
  @ValidateNested()
  @Type(() => CreateContactInfoDto)
  contactInfo: CreateContactInfoDto;

  @ApiProperty({
    type: CreateLocationInfoDto,
    example: {
      region: 'RIFT VALLEY',
      subRegion: 'NAKURU',
      coordinates: { latitude: -0.81279, longitude: 36.39084 },
    },
  })
  @ValidateNested()
  @Type(() => CreateLocationInfoDto)
  locationInfo: CreateLocationInfoDto;

  @ApiProperty({
    type: CreateSiteDetailsDto,
    example: {
      siteId: '13632_RV_NO1029-Longonot_Farm_OUTN_MGF',
      siteType: 'Green Field',
      siteClassification: 'Last Mile',
    },
  })
  @ValidateNested()
  @Type(() => CreateSiteDetailsDto)
  siteDetails: CreateSiteDetailsDto;

  @ApiPropertyOptional({
    description: 'Dynamic design summary fields',
    type: 'object',
    additionalProperties: true,
    example: {
      existingPowerSupply: 'Grid+ DG+ Batteries',
      sitePowerDemandDailyEnergyDemand: '73.69 kWH',
      solarDesignLimitation: 'Space',
      proposedSolarCapacity: '9.28kWp',
      proposedBatteryCapacity: '700AH(HUAWEI CloudLi ESM 48100B1)',
      proposedRectifierCapacity: '36Kw (Huawei ICC330 H1-C12)',
      estimatedSolarProductionPerMonth: '1,059.3 kWH',
      solarPenetration: '48%',
      generatorComment:
        'Generator recovery due to the achievement of the 8hr B.H.T',
      dabApprovalComments: '',
    },
  })
  @IsOptional()
  @IsObject()
  designSummary?: Record<string, any>;

  @ApiPropertyOptional({
    type: [CreateBillOfMaterialsItemDto],
    example: [
      {
        item: 'Li Battery Capacity (Ah)',
        specs: '100AH',
        unitOfMeasure: 'Pcs',
        quantity: 7,
        bomType: 'Equipment',
      },
      {
        item: 'Rectifier Capacity',
        specs: '36kw',
        unitOfMeasure: 'Pcs',
        quantity: 1,
        bomType: 'Equipment',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBillOfMaterialsItemDto)
  billOfMaterials?: CreateBillOfMaterialsItemDto[];

  @ApiPropertyOptional({ example: 'approved' })
  @IsOptional()
  @IsEnum(['draft', 'pending', 'approved', 'rejected', 'completed'])
  status?: string;

  @ApiPropertyOptional({ example: 'Approved' })
  @IsOptional()
  @IsString()
  comments?: string;
}

// update-service-order.dto.ts
export class UpdateServiceOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  issuedBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  issuedTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  serviceOrderDate?: string;

  @ApiPropertyOptional({ type: CreateContactInfoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateContactInfoDto)
  contactInfo?: CreateContactInfoDto;

  @ApiPropertyOptional({ type: CreateLocationInfoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateLocationInfoDto)
  locationInfo?: CreateLocationInfoDto;

  @ApiPropertyOptional({ type: CreateSiteDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateSiteDetailsDto)
  siteDetails?: CreateSiteDetailsDto;

  @ApiPropertyOptional({
    description: 'Dynamic design summary fields',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  designSummary?: Record<string, any>;

  @ApiPropertyOptional({ type: [CreateBillOfMaterialsItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBillOfMaterialsItemDto)
  billOfMaterials?: CreateBillOfMaterialsItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['draft', 'pending', 'approved', 'rejected', 'completed'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comments?: string;
}
