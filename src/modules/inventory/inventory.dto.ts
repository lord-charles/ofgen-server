import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  IsDate,
  Min,
  Max,
  ValidateNested,
  IsNotEmpty,
  Matches,
  IsEmail,
  ArrayMinSize,
  IsMongoId,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
  OmitType,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import {
  ItemCategory,
  UnitOfMeasure,
  StockStatus,
  TransactionType,
  SupplierType,
  ItemCondition,
} from './inventory.schema';

// ========================= BASE DTOs =========================

export class TechnicalSpecsDto {
  @ApiPropertyOptional({
    description: 'Power rating for electrical equipment',
    example: '50kW',
  })
  @IsOptional()
  @IsString()
  powerRating?: string;

  @ApiPropertyOptional({
    description: 'Voltage specification',
    example: '415V AC',
  })
  @IsOptional()
  @IsString()
  voltage?: string;

  @ApiPropertyOptional({
    description: 'Current rating',
    example: '75A',
  })
  @IsOptional()
  @IsString()
  current?: string;

  @ApiPropertyOptional({
    description: 'Operating frequency',
    example: '50Hz',
  })
  @IsOptional()
  @IsString()
  frequency?: string;

  @ApiPropertyOptional({
    description: 'Physical dimensions (L x W x H)',
    example: '600mm x 400mm x 200mm',
  })
  @IsOptional()
  @IsString()
  dimensions?: string;

  @ApiPropertyOptional({
    description: 'Equipment weight',
    example: '25kg',
  })
  @IsOptional()
  @IsString()
  weight?: string;

  @ApiPropertyOptional({
    description: 'Operating temperature range',
    example: '-10°C to +50°C',
  })
  @IsOptional()
  @IsString()
  temperatureRange?: string;

  @ApiPropertyOptional({
    description: 'IP rating for environmental protection',
    example: 'IP65',
  })
  @IsOptional()
  @IsString()
  ipRating?: string;

  @ApiPropertyOptional({
    description: 'Efficiency rating percentage',
    example: '95%',
  })
  @IsOptional()
  @IsString()
  efficiency?: string;

  @ApiPropertyOptional({
    description: 'Cable cross-sectional area',
    example: '16mm²',
  })
  @IsOptional()
  @IsString()
  crossSection?: string;

  @ApiPropertyOptional({
    description: 'Material composition',
    example: 'Copper, PVC insulated',
  })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({
    description: 'Color or finish specification',
    example: 'RAL 7035 Light Grey',
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    description: 'Additional technical specifications',
    type: 'object',
    additionalProperties: { type: 'string' },
    example: { protection_class: 'Class I', certification: 'CE, IEC 61439' },
  })
  @IsOptional()
  additionalSpecs?: Record<string, string>;
}

export class PricingInfoDto {
  @ApiProperty({
    description: 'Standard cost price in KES',
    example: 25000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  standardCost: number;

  @ApiProperty({
    description: 'Last purchase price in KES',
    example: 23500,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  lastPurchasePrice: number;

  @ApiPropertyOptional({
    description: 'Selling price in KES',
    example: 32000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'KES',
    default: 'KES',
  })
  @IsString()
  currency: string;
}

export class StockLevelDto {
  @ApiProperty({
    description: 'Stock location MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  location: string;

  @ApiProperty({
    description: 'Current quantity in stock',
    example: 150,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  currentStock: number;

  @ApiPropertyOptional({
    description: 'Reserved quantity for ongoing projects',
    example: 25,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reservedStock?: number;

  @ApiProperty({
    description: 'Minimum stock level before reorder',
    example: 20,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  minimumLevel: number;

  @ApiPropertyOptional({
    description: 'Maximum stock level capacity',
    example: 500,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumLevel?: number;

  @ApiProperty({
    description: 'Reorder point threshold',
    example: 30,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  reorderPoint: number;
}

// ========================= INVENTORY ITEM DTOs =========================

export class CreateInventoryItemDto {
  @ApiProperty({
    description: 'Descriptive name of the inventory item',
    example: 'Schneider Electric Circuit Breaker 63A',
  })
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @ApiProperty({
    description: 'Unique item code/SKU for inventory tracking',
    example: 'SCH-CB63-001',
    pattern: '^[A-Z0-9-]+$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9-]+$/, {
    message:
      'Item code must contain only uppercase letters, numbers, and hyphens',
  })
  itemCode: string;

  @ApiPropertyOptional({
    description: 'Alternative codes like manufacturer part numbers',
    example: ['NSX100F', 'LV429630'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alternativeCodes?: string[];

  @ApiPropertyOptional({
    description: 'Detailed description of the item',
    example:
      'Compact NSX circuit breaker, 63A rating, suitable for industrial applications in Kenya',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Item category classification',
    enum: ItemCategory,
    example: ItemCategory.BREAKER,
  })
  @IsEnum(ItemCategory)
  category: ItemCategory;

  @ApiProperty({
    description: 'Unit of measurement for inventory tracking',
    enum: UnitOfMeasure,
    example: UnitOfMeasure.PIECES,
  })
  @IsEnum(UnitOfMeasure)
  unitOfMeasure: UnitOfMeasure;

  @ApiPropertyOptional({
    description: 'Manufacturer or brand name',
    example: 'Schneider Electric',
  })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({
    description: 'Manufacturer model number',
    example: 'NSX100F-63A',
  })
  @IsOptional()
  @IsString()
  modelNumber?: string;

  @ApiPropertyOptional({
    description: 'Serial number for serialized items',
    example: 'SE2024001234',
  })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({
    description: 'Batch or lot number for tracking',
    example: 'LOT-2024-Q1-001',
  })
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiPropertyOptional({
    description: 'Physical condition of the item',
    enum: ItemCondition,
    example: ItemCondition.NEW,
    default: ItemCondition.NEW,
  })
  @IsOptional()
  @IsEnum(ItemCondition)
  condition?: ItemCondition;

  @ApiPropertyOptional({
    description: 'Technical specifications object',
    type: TechnicalSpecsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TechnicalSpecsDto)
  technicalSpecs?: TechnicalSpecsDto;

  @ApiPropertyOptional({
    description: 'Primary supplier company name',
    example: 'East African Electrical Supplies Ltd',
  })
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiProperty({
    description: 'Stock levels across different locations',
    type: [StockLevelDto],
    example: [
      {
        location: '507f1f77bcf86cd799439011',
        currentStock: 150,
        reservedStock: 25,
        minimumLevel: 20,
        maximumLevel: 500,
        reorderPoint: 30,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockLevelDto)
  @ArrayMinSize(1)
  stockLevels: StockLevelDto[];

  @ApiPropertyOptional({
    description: 'Pricing information',
    type: PricingInfoDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PricingInfoDto)
  pricing?: PricingInfoDto;

  @ApiPropertyOptional({
    description: 'Whether item is currently active in system',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Whether each item is tracked by serial number',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isSerialized?: boolean;

  @ApiPropertyOptional({
    description: 'Whether item represents a service rather than physical goods',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isService?: boolean;

  @ApiPropertyOptional({
    description: 'Whether item is consumable (depleted when used)',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isConsumable?: boolean;

  @ApiPropertyOptional({
    description: 'Shelf life in days for perishable items',
    example: 365,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shelfLifeDays?: number;

  @ApiPropertyOptional({
    description: 'Warranty period in months',
    example: 24,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  warrantyMonths?: number;

  @ApiPropertyOptional({
    description: 'Special storage requirements',
    example: 'Store in dry place, temperature 5-35°C, protect from moisture',
  })
  @IsOptional()
  @IsString()
  storageRequirements?: string;

  @ApiPropertyOptional({
    description: 'Safety and hazard information',
    example: 'Electrical hazard - handle with appropriate PPE',
  })
  @IsOptional()
  @IsString()
  safetyInfo?: string;

  @ApiPropertyOptional({
    description: 'URLs to item images',
    example: ['https://example.com/images/item1.jpg'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @ApiPropertyOptional({
    description: 'Document attachment URLs (datasheets, manuals)',
    example: ['https://example.com/docs/manual.pdf'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiPropertyOptional({
    description: 'QR code data for mobile scanning',
    example: 'INV-SCH-CB63-001',
  })
  @IsOptional()
  @IsString()
  qrCode?: string;

  @ApiPropertyOptional({
    description: 'Barcode for scanning systems',
    example: '1234567890123',
  })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({
    description: 'Additional notes and comments',
    example:
      'Suitable for Kenya Power grid standards, meets IEC specifications',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateInventoryItemDto extends PartialType(
  CreateInventoryItemDto,
) {
  @ApiPropertyOptional({
    description: 'Item ID for update operations',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  id?: string;
}

export class InventoryItemResponseDto extends CreateInventoryItemDto {
  @ApiProperty({
    description: 'MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: 'Current stock status',
    enum: StockStatus,
    example: StockStatus.IN_STOCK,
  })
  stockStatus: StockStatus;

  @ApiProperty({
    description: 'Total stock across all locations',
    example: 125,
  })
  totalStock: number;

  @ApiProperty({
    description: 'Total reserved stock across all locations',
    example: 25,
  })
  totalReserved: number;

  @ApiProperty({
    description: 'Total available stock across all locations',
    example: 100,
  })
  totalAvailable: number;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2024-06-02T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last modification timestamp',
    example: '2024-06-02T15:30:00.000Z',
  })
  updatedAt: Date;
}

// ========================= TRANSACTION DTOs =========================

export class CreateTransactionDto {
  @ApiPropertyOptional({
    description:
      'Unique transaction reference number (auto-generated if not provided)',
    example: 'TXN-PUR-20250602-ABC12345',
  })
  @IsOptional()
  @IsString()
  transactionRef?: string;

  @ApiProperty({
    description: 'Inventory item MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  inventoryItem: string;

  @ApiProperty({
    description: 'Type of inventory transaction',
    enum: TransactionType,
    examples: [
      {
        value: TransactionType.PURCHASE,
        summary: 'Purchase from supplier',
        description:
          'Required fields: inventoryItem, quantity, toLocation, supplier',
      },
      {
        value: TransactionType.SALE,
        summary: 'Sale to customer',
        description: 'Required fields: inventoryItem, quantity, fromLocation',
      },
      {
        value: TransactionType.TRANSFER,
        summary: 'Transfer between warehouses',
        description:
          'Required fields: inventoryItem, quantity, fromLocation, toLocation',
      },
      {
        value: TransactionType.ADJUSTMENT_IN,
        summary: 'Stock increase adjustment',
        description: 'Required fields: inventoryItem, quantity, toLocation',
      },
      {
        value: TransactionType.ADJUSTMENT_OUT,
        summary: 'Stock decrease adjustment',
        description: 'Required fields: inventoryItem, quantity, fromLocation',
      },
      {
        value: TransactionType.RETURN,
        summary: 'Return from customer',
        description: 'Required fields: inventoryItem, quantity, toLocation',
      },
      {
        value: TransactionType.ALLOCATION,
        summary: 'Reserve stock for project',
        description:
          'Required fields: inventoryItem, quantity, fromLocation, project',
      },
      {
        value: TransactionType.CONSUMPTION,
        summary: 'Consume stock for internal use',
        description: 'Required fields: inventoryItem, quantity, fromLocation',
      },
      {
        value: TransactionType.DAMAGE,
        summary: 'Record damaged stock',
        description: 'Required fields: inventoryItem, quantity, fromLocation',
      },
      {
        value: TransactionType.MAINTENANCE,
        summary: 'Use stock for maintenance',
        description: 'Required fields: inventoryItem, quantity, fromLocation',
      },
    ],
  })
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @ApiProperty({
    description:
      'Quantity involved in transaction (positive for inbound, negative for outbound)',
    example: 50,
  })
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional({
    description: 'Unit price at time of transaction in KES',
    example: 1500,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @ApiPropertyOptional({
    description: 'Total transaction value in KES',
    example: 75000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalValue?: number;

  @ApiPropertyOptional({
    description:
      'Source location MongoDB ObjectId (required for: SALE, TRANSFER, ADJUSTMENT_OUT, ALLOCATION, CONSUMPTION, DAMAGE, MAINTENANCE)',
    example: '507f1f77bcf86cd799439012',
  })
  @IsOptional()
  @IsMongoId()
  fromLocation?: string;

  @ApiPropertyOptional({
    description:
      'Destination location MongoDB ObjectId (required for: PURCHASE, TRANSFER, ADJUSTMENT_IN, RETURN)',
    example: '507f1f77bcf86cd799439013',
  })
  @IsOptional()
  @IsMongoId()
  toLocation?: string;

  @ApiPropertyOptional({
    description: 'Related project MongoDB ObjectId (required for ALLOCATION)',
    example: '507f1f77bcf86cd799439014',
  })
  @IsOptional()
  @IsMongoId()
  project?: string;

  @ApiPropertyOptional({
    description: 'Supplier MongoDB ObjectId (typically used for PURCHASE)',
    example: '507f1f77bcf86cd799439015',
  })
  @IsOptional()
  @IsMongoId()
  supplier?: string;

  @ApiProperty({
    description: 'User who performed the transaction',
    example: '507f1f77bcf86cd799439016',
  })
  @IsMongoId()
  performedBy: string;

  @ApiPropertyOptional({
    description: 'Transaction date and time',
    example: '2024-06-02T14:30:00.000Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  transactionDate?: Date;

  @ApiPropertyOptional({
    description: 'Additional notes or reason for transaction',
    example:
      'Purchase from East African Electrical Supplies for Thika substation project',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Related document reference (invoice, receipt, etc.)',
    example: 'INV-EAES-2024-5678',
  })
  @IsOptional()
  @IsString()
  documentRef?: string;
}

export class TransactionResponseDto extends CreateTransactionDto {
  @ApiProperty({
    description: 'MongoDB ObjectId',
    example: '507f1f77bcf86cd799439017',
  })
  _id: string;

  @ApiPropertyOptional({
    description: 'Stock level before transaction',
    example: 100,
  })
  stockBefore?: number;

  @ApiPropertyOptional({
    description: 'Stock level after transaction',
    example: 150,
  })
  stockAfter?: number;

  @ApiProperty({
    description: 'Transaction creation timestamp',
    example: '2024-06-02T14:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Transaction last update timestamp',
    example: '2024-06-02T14:30:00.000Z',
  })
  updatedAt: Date;
}

// ========================= SUPPLIER DTOs =========================

export class CreateSupplierDto {
  @ApiProperty({
    description: 'Supplier company name',
    example: 'East African Electrical Supplies Ltd',
  })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({
    description: 'Type of supplier organization',
    enum: SupplierType,
    example: SupplierType.DISTRIBUTOR,
  })
  @IsEnum(SupplierType)
  supplierType: SupplierType;

  @ApiPropertyOptional({
    description: 'Primary contact person name',
    example: 'James Mwangi',
  })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiPropertyOptional({
    description: 'Contact email address',
    example: 'james.mwangi@eaes.co.ke',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Primary phone number',
    example: '+254-20-1234567',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+254-\d{2,3}-\d{6,7}$/, {
    message: 'Phone number must be in format +254-XX-XXXXXXX',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Alternative phone number',
    example: '+254-722-123456',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+254-\d{3}-\d{6}$/, {
    message: 'Mobile number must be in format +254-XXX-XXXXXX',
  })
  alternatePhone?: string;

  @ApiPropertyOptional({
    description: 'Physical business address',
    example: 'Industrial Area, Nairobi Road, Plot 123',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'City location',
    example: 'Nairobi',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Country',
    example: 'Kenya',
    default: 'Kenya',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'Payment terms agreement',
    example: 'Net 30 days',
  })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiPropertyOptional({
    description: 'Supplier performance rating (1-5 stars)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Additional notes about the supplier',
    example:
      'Reliable supplier for electrical components, good delivery times to Nairobi area',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {}

export class SupplierResponseDto extends CreateSupplierDto {
  @ApiProperty({
    description: 'MongoDB ObjectId',
    example: '507f1f77bcf86cd799439018',
  })
  _id: string;

  @ApiProperty({
    description: 'Supplier creation timestamp',
    example: '2024-06-02T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last modification timestamp',
    example: '2024-06-02T15:30:00.000Z',
  })
  updatedAt: Date;
}

// ========================= STOCK LOCATION DTOs =========================

export class CreateStockLocationDto {
  @ApiProperty({
    description: 'Stock location name',
    example: 'Nairobi Main Warehouse',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Physical address of the location',
    example: 'Industrial Area, Lusaka Road, Warehouse Block C',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'City where location is situated',
    example: 'Nairobi',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'County within Kenya',
    example: 'Nairobi County',
  })
  @IsOptional()
  @IsString()
  county?: string;
}

export class UpdateStockLocationDto extends PartialType(
  CreateStockLocationDto,
) {}

export class StockLocationResponseDto extends CreateStockLocationDto {
  @ApiProperty({
    description: 'MongoDB ObjectId',
    example: '507f1f77bcf86cd799439019',
  })
  _id: string;

  @ApiProperty({
    description: 'Location creation timestamp',
    example: '2024-06-02T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last modification timestamp',
    example: '2024-06-02T15:30:00.000Z',
  })
  updatedAt: Date;
}

// ========================= QUERY DTOs =========================

export class InventoryQueryDto {
  @ApiPropertyOptional({
    description: 'Search term for item name or code',
    example: 'circuit breaker',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by item category',
    enum: ItemCategory,
    example: ItemCategory.BREAKER,
  })
  @IsOptional()
  @IsEnum(ItemCategory)
  category?: ItemCategory;

  @ApiPropertyOptional({
    description: 'Filter by stock status',
    enum: StockStatus,
    example: StockStatus.IN_STOCK,
  })
  @IsOptional()
  @IsEnum(StockStatus)
  stockStatus?: StockStatus;

  @ApiPropertyOptional({
    description: 'Filter by supplier name',
    example: 'Schneider Electric',
  })
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiPropertyOptional({
    description: 'Filter active items only',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'itemName',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'asc',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

export class TransactionQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by inventory item ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  inventoryItem?: string;

  @ApiPropertyOptional({
    description: 'Filter by transaction type',
    enum: TransactionType,
    example: TransactionType.PURCHASE,
  })
  @IsOptional()
  @IsEnum(TransactionType)
  transactionType?: TransactionType;

  @ApiPropertyOptional({
    description: 'Filter transactions from date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateFrom?: Date;

  @ApiPropertyOptional({
    description: 'Filter transactions to date',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateTo?: Date;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number;
}

// ========================= RESPONSE DTOs =========================

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Array of data items' })
  data: T[];

  @ApiProperty({ description: 'Total number of items', example: 150 })
  total: number;

  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 20 })
  limit: number;

  @ApiProperty({ description: 'Total number of pages', example: 8 })
  totalPages: number;

  @ApiProperty({ description: 'Whether there are more pages', example: true })
  hasNext: boolean;

  @ApiProperty({
    description: 'Whether there are previous pages',
    example: false,
  })
  hasPrev: boolean;
}

export class ApiResponseDto<T> {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully',
  })
  message: string;

  @ApiProperty({ description: 'Response data' })
  data?: T;

  @ApiProperty({ description: 'Error details (if any)' })
  error?: any;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-06-02T15:30:00.000Z',
  })
  timestamp: Date;
}

// ========================= BULK OPERATION DTOs =========================

export class BulkUpdateStockDto {
  @ApiProperty({
    description: 'Array of stock updates',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        itemId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        locationId: { type: 'string', example: '507f1f77bcf86cd799439012' },
        quantity: { type: 'number', example: 50 },
        operation: {
          type: 'string',
          enum: ['add', 'subtract', 'set'],
          example: 'add',
        },
      },
    },
  })
  @IsArray()
  @ValidateNested({ each: true })
  updates: Array<{
    itemId: string;
    locationId: string;
    quantity: number;
    operation: 'add' | 'subtract' | 'set';
  }>;

  @ApiProperty({
    description: 'User performing bulk operation',
    example: '507f1f77bcf86cd799439016',
  })
  @IsMongoId()
  performedBy: string;

  @ApiPropertyOptional({
    description: 'Reason for bulk update',
    example: 'Monthly stock reconciliation',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class StockAdjustmentDto {
  @ApiProperty({
    description: 'Inventory item ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  itemId: string;

  @ApiProperty({
    description: 'Stock location ID',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId()
  locationId: string;

  @ApiProperty({
    description:
      'Adjustment quantity (positive for increase, negative for decrease)',
    example: -5,
  })
  @IsNumber()
  adjustmentQuantity: number;

  @ApiProperty({
    description: 'Reason for stock adjustment',
    example: 'Damaged items removed from inventory',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    description: 'User performing adjustment',
    example: '507f1f77bcf86cd799439016',
  })
  @IsMongoId()
  performedBy: string;

  @ApiPropertyOptional({
    description: 'Reference document',
    example: 'DAMAGE-REPORT-2024-001',
  })
  @IsOptional()
  @IsString()
  documentRef?: string;
}

// ========================= REPORTING DTOs =========================

export class StockReportDto {
  @ApiPropertyOptional({
    description: 'Filter by category',
    enum: ItemCategory,
  })
  @IsOptional()
  @IsEnum(ItemCategory)
  category?: ItemCategory;

  @ApiPropertyOptional({
    description: 'Filter by location',
    example: '507f1f77bcf86cd799439012',
  })
  @IsOptional()
  @IsMongoId()
  locationId?: string;

  @ApiPropertyOptional({
    description: 'Include only low stock items',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  lowStockOnly?: boolean;

  @ApiPropertyOptional({
    description: 'Include stock valuation',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  includeValuation?: boolean;
}

export class StockMovementReportDto {
  @ApiProperty({
    description: 'Report start date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    description: 'Report end date',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiPropertyOptional({
    description: 'Filter by inventory item',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  itemId?: string;

  @ApiPropertyOptional({
    description: 'Filter by location',
    example: '507f1f77bcf86cd799439012',
  })
  @IsOptional()
  @IsMongoId()
  locationId?: string;

  @ApiPropertyOptional({
    description: 'Group by period',
    enum: ['day', 'week', 'month'],
    example: 'month',
  })
  @IsOptional()
  @IsString()
  groupBy?: 'day' | 'week' | 'month';
}

export class InventoryValuationDto {
  @ApiProperty({ description: 'Item details' })
  item: {
    _id: string;
    itemName: string;
    itemCode: string;
    category: ItemCategory;
  };

  @ApiProperty({ description: 'Current stock quantity', example: 150 })
  currentStock: number;

  @ApiProperty({ description: 'Standard cost per unit in KES', example: 1500 })
  standardCost: number;

  @ApiProperty({ description: 'Total value in KES', example: 225000 })
  totalValue: number;

  @ApiProperty({ description: 'Last purchase price in KES', example: 1450 })
  lastPurchasePrice: number;

  @ApiProperty({
    description: 'Value at last purchase price in KES',
    example: 217500,
  })
  lastPurchaseValue: number;
}

// ========================= DASHBOARD DTOs =========================

export class DashboardStatsDto {
  @ApiProperty({
    description: 'Total number of active inventory items',
    example: 1250,
  })
  totalItems: number;

  @ApiProperty({
    description: 'Total inventory value in KES',
    example: 15750000,
  })
  totalValue: number;

  @ApiProperty({ description: 'Number of low stock items', example: 23 })
  lowStockItems: number;

  @ApiProperty({ description: 'Number of out of stock items', example: 8 })
  outOfStockItems: number;

  @ApiProperty({
    description: 'Number of transactions this month',
    example: 156,
  })
  monthlyTransactions: number;

  @ApiProperty({ description: 'Top moving categories this month' })
  topCategories: Array<{
    category: ItemCategory;
    transactionCount: number;
    totalQuantity: number;
  }>;

  @ApiProperty({ description: 'Recent stock alerts' })
  recentAlerts: Array<{
    itemId: string;
    itemName: string;
    currentStock: number;
    minimumLevel: number;
    location: string;
    alertType: 'low_stock' | 'out_of_stock' | 'overstock';
  }>;
}

// ========================= RESERVED STOCK MANAGEMENT =========================

export enum ReservedStockAction {
  INCREASE = 'increase',
  DECREASE = 'decrease',
  UNRESERVE_ALL = 'unreserve_all',
}

export class ReservedStockUpdateDto {
  @ApiProperty({
    description: 'Inventory item MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  inventoryItem: string;

  @ApiProperty({
    description: 'Warehouse/location MongoDB ObjectId',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId()
  location: string;

  @ApiProperty({
    description: 'Action to perform on reserved stock',
    enum: ReservedStockAction,
    example: ReservedStockAction.DECREASE,
  })
  @IsEnum(ReservedStockAction)
  action: ReservedStockAction;

  @ApiProperty({
    description: 'Quantity to increase/decrease (not used for UNRESERVE_ALL)',
    example: 10,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @ApiProperty({
    description: 'User performing the update',
    example: '507f1f77bcf86cd799439016',
  })
  @IsMongoId()
  performedBy: string;

  @ApiPropertyOptional({
    description: 'Reason for the reserved stock update',
    example: 'Project scope reduced, fewer materials needed',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

// ========================= VALIDATION GROUPS =========================

export class ValidationGroups {
  static readonly CREATE = 'create';
  static readonly UPDATE = 'update';
  static readonly BULK = 'bulk';
}
