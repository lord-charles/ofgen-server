import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsDate,
  IsArray,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { customAlphabet } from 'nanoid';

export type InventoryItemDocument = InventoryItem & Document;
export type SupplierDocument = Supplier & Document;
export type InventoryTransactionDocument = InventoryTransaction & Document;
export type StockLocationDocument = StockLocation & Document;

// ========================= ENUMS =========================

export enum ItemCategory {
  // Power & Energy Systems
  GENERATOR = 'Generator',
  RECTIFIER = 'Rectifier System',
  INVERTER = 'Inverter',
  BATTERY = 'Battery',
  BATTERY_CABINET = 'Battery Cabinet',

  // Solar & Renewable Energy
  SOLAR_PANEL = 'Solar Panel',
  PV_CONTROLLER = 'PV Controller',
  SOLAR_STRUCTURE = 'Solar Structure',
  SOLAR_SYSTEM = 'Solar PV System',

  // Cables & Electrical
  POWER_CABLE = 'Power Cable',
  CONTROL_CABLE = 'Control Cable',
  FLEX_CABLE = 'Flex Cable',
  EARTHING_CABLE = 'Earthing Cable',

  // Installation Materials
  CONDUIT = 'Conduit',
  CABLE_TRAY = 'Cable Tray',
  DUCTING = 'Ducting',
  EARTHING_ROD = 'Earthing Rod',

  // Hardware & Accessories
  CONNECTOR = 'Connector',
  BREAKER = 'Circuit Breaker',
  CABLE_LUG = 'Cable Lug',
  INSULATION = 'Insulation Material',
  MOUNTING_HARDWARE = 'Mounting Hardware',

  // Construction Materials
  CONCRETE = 'Concrete',
  EXCAVATION = 'Excavation Work',
  SLAB_WORK = 'Slab Work',

  // Tools & Equipment
  INSTALLATION_TOOL = 'Installation Tool',
  TESTING_EQUIPMENT = 'Testing Equipment',

  // Services
  INSTALLATION_SERVICE = 'Installation Service',
  COMMISSIONING_SERVICE = 'Commissioning Service',
  MAINTENANCE_SERVICE = 'Maintenance Service',

  SPARE_PART = 'Spare Part',

  CONSUMABLE = 'Consumable',

  OTHER = 'Other',
}

export enum UnitOfMeasure {
  // Quantity Units
  PIECES = 'Pcs',
  SETS = 'Sets',
  UNITS = 'Units',

  // Length Units
  METERS = 'Meters',
  KILOMETERS = 'Kilometers',
  FEET = 'Feet',

  // Area Units
  SQUARE_METERS = 'M²',
  SQUARE_FEET = 'Ft²',

  // Volume Units
  CUBIC_METERS = 'M³',
  CUBIC_FEET = 'Ft³',
  LITERS = 'Liters',

  // Weight Units
  KILOGRAMS = 'Kg',
  TONNES = 'Tonnes',
  POUNDS = 'Lbs',

  // Power Units
  KILOWATTS = 'kW',
  KWP = 'KWp',
  KVA = 'kVA',
  AMPERE_HOURS = 'AH',
  WATTS = 'W',
  VOLTS = 'V',

  // Service Units
  HOURS = 'Hours',
  DAYS = 'Days',
  MANHOURS = 'Man-hours',

  // Others
  ROLLS = 'Rolls',
  BOXES = 'Boxes',
  PACKETS = 'Packets',
}

export enum StockStatus {
  IN_STOCK = 'In Stock',
  LOW_STOCK = 'Low Stock',
  OUT_OF_STOCK = 'Out of Stock',
  ON_ORDER = 'On Order',
  DISCONTINUED = 'Discontinued',
  QUARANTINED = 'Quarantined',
}

export enum TransactionType {
  PURCHASE = 'Purchase',
  SALE = 'Sale',
  TRANSFER = 'Transfer',
  ADJUSTMENT_IN = 'Adjustment In',
  ADJUSTMENT_OUT = 'Adjustment Out',
  RETURN = 'Return',
  ALLOCATION = 'Project Allocation',
  CONSUMPTION = 'Consumption',
  DAMAGE = 'Damage/Loss',
  MAINTENANCE = 'Maintenance Use',
}

export enum SupplierType {
  MANUFACTURER = 'Manufacturer',
  DISTRIBUTOR = 'Distributor',
  LOCAL_SUPPLIER = 'Local Supplier',
  INTERNATIONAL = 'International Supplier',
  SERVICE_PROVIDER = 'Service Provider',
}

export enum ItemCondition {
  NEW = 'New',
  REFURBISHED = 'Refurbished',
  USED_GOOD = 'Used - Good',
  USED_FAIR = 'Used - Fair',
  DAMAGED = 'Damaged',
  FOR_REPAIR = 'For Repair',
}

// ========================= SUPPLIER SCHEMA =========================

@Schema({ timestamps: true })
export class Supplier {
  @ApiProperty({ description: 'Supplier company name' })
  @Prop({ required: true, trim: true })
  @IsString()
  companyName: string;

  @ApiProperty({ description: 'Supplier type', enum: SupplierType })
  @Prop({ required: true, enum: Object.values(SupplierType) })
  @IsEnum(SupplierType)
  supplierType: SupplierType;

  @ApiProperty({ description: 'Primary contact person' })
  @Prop({ trim: true })
  @IsString()
  contactPerson?: string;

  @ApiProperty({ description: 'Contact email' })
  @Prop({ lowercase: true, trim: true })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Primary phone number' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Alternative phone number' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  alternatePhone?: string;

  @ApiProperty({ description: 'Physical address' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'City' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'Country' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ description: 'Payment terms (e.g., Net 30)' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiProperty({ description: 'Supplier rating (1-5)' })
  @Prop({ min: 1, max: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({ description: 'Additional notes' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);

// ========================= STOCK LOCATION SCHEMA =========================

@Schema({ timestamps: true })
export class StockLocation {
  @ApiProperty({ description: 'Location name' })
  @Prop({ required: true, trim: true })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Physical address' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'City' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'County' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  county?: string;
}

export const StockLocationSchema = SchemaFactory.createForClass(StockLocation);

// ========================= INVENTORY ITEM SUBSCHEMAS =========================

@Schema({ _id: false })
export class StockLevel {
  @ApiProperty({ description: 'Stock location' })
  @Prop({ type: Types.ObjectId, ref: 'StockLocation', required: true })
  location: Types.ObjectId;

  @ApiProperty({ description: 'Current quantity in stock' })
  @Prop({ required: true, min: 0, default: 0 })
  @IsNumber()
  @Min(0)
  currentStock: number;

  @ApiProperty({
    description: 'Reserved quantity (allocated but not yet consumed)',
  })
  @Prop({ min: 0, default: 0 })
  @IsNumber()
  @Min(0)
  reservedStock: number;

  @ApiProperty({ description: 'Available quantity' })
  @Prop({ min: 0, default: 0 })
  @IsNumber()
  @Min(0)
  availableStock: number;

  @ApiProperty({ description: 'Minimum stock level threshold' })
  @Prop({ min: 0, default: 0 })
  @IsNumber()
  @Min(0)
  minimumLevel: number;

  @ApiProperty({ description: 'Maximum stock level' })
  @Prop({ min: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumLevel?: number;

  @ApiProperty({ description: 'Reorder point' })
  @Prop({ min: 0, default: 0 })
  @IsNumber()
  @Min(0)
  reorderPoint: number;
}

const StockLevelSchema = SchemaFactory.createForClass(StockLevel);

@Schema({ _id: false })
export class PricingInfo {
  @ApiProperty({ description: 'Standard cost price' })
  @Prop({ min: 0, default: 0 })
  @IsNumber()
  @Min(0)
  standardCost: number;

  @ApiProperty({ description: 'Last purchase price' })
  @Prop({ min: 0, default: 0 })
  @IsNumber()
  @Min(0)
  lastPurchasePrice: number;

  @ApiProperty({ description: 'Selling price' })
  @Prop({ min: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;

  @ApiProperty({ description: 'Currency' })
  @Prop({ default: 'KES', trim: true })
  @IsString()
  currency: string;
}

const PricingInfoSchema = SchemaFactory.createForClass(PricingInfo);

@Schema({ _id: false })
export class TechnicalSpecs {
  @ApiProperty({ description: 'Power rating (for electrical items)' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  powerRating?: string;

  @ApiProperty({ description: 'Voltage rating' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  voltage?: string;

  @ApiProperty({ description: 'Current rating' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  current?: string;

  @ApiProperty({ description: 'Frequency' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  frequency?: string;

  @ApiProperty({ description: 'Dimensions (L x W x H)' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  dimensions?: string;

  @ApiProperty({ description: 'Weight' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  weight?: string;

  @ApiProperty({ description: 'Operating temperature range' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  temperatureRange?: string;

  @ApiProperty({ description: 'IP rating (for outdoor equipment)' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  ipRating?: string;

  @ApiProperty({ description: 'Efficiency rating' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  efficiency?: string;

  @ApiProperty({ description: 'Cable cross-section (for cables)' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  crossSection?: string;

  @ApiProperty({ description: 'Material composition' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiProperty({ description: 'Color/finish' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'Additional specifications' })
  @Prop({ type: Map, of: String })
  @IsOptional()
  additionalSpecs?: Map<string, string>;
}
const TechnicalSpecsSchema = SchemaFactory.createForClass(TechnicalSpecs);

// ========================= MAIN INVENTORY ITEM SCHEMA =========================
@Schema({ timestamps: true })
export class InventoryItem {
  @ApiProperty({ description: 'Item name/title' })
  @Prop({ required: true, trim: true })
  @IsString()
  itemName: string;

  @ApiProperty({ description: 'Unique item code/SKU' })
  @Prop({ required: true, unique: true, trim: true })
  @IsString()
  itemCode: string;

  @ApiProperty({
    description: 'Alternative item codes (manufacturer part numbers, etc.)',
  })
  @Prop({ type: [String], default: [] })
  @IsArray()
  @IsOptional()
  alternativeCodes?: string[];

  @ApiProperty({ description: 'Item description' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Item category', enum: ItemCategory })
  @Prop({ required: true, enum: Object.values(ItemCategory) })
  @IsEnum(ItemCategory)
  category: ItemCategory;

  @ApiProperty({ description: 'Unit of measure', enum: UnitOfMeasure })
  @Prop({ required: true, enum: Object.values(UnitOfMeasure) })
  @IsEnum(UnitOfMeasure)
  unitOfMeasure: UnitOfMeasure;

  @ApiProperty({ description: 'Manufacturer/brand name' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiProperty({ description: 'Model number' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  modelNumber?: string;

  @ApiProperty({ description: 'Serial number (for tracked items)' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiProperty({ description: 'Batch/lot number' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiProperty({ description: 'Item condition', enum: ItemCondition })
  @Prop({ enum: Object.values(ItemCondition), default: ItemCondition.NEW })
  @IsEnum(ItemCondition)
  condition: ItemCondition;

  @ApiProperty({
    description: 'Technical specifications',
    type: TechnicalSpecs,
  })
  @Prop({ type: TechnicalSpecsSchema })
  @IsOptional()
  technicalSpecs?: TechnicalSpecs;

  @ApiProperty({ description: 'Supplier' })
  @Prop({ type: String })
  @IsOptional()
  supplier?: string;

  @ApiProperty({
    description: 'Stock levels across locations',
    type: [StockLevel],
  })
  @Prop({ type: [StockLevelSchema], default: [] })
  @IsArray()
  stockLevels: StockLevel[];

  @ApiProperty({ description: 'Pricing information', type: PricingInfo })
  @Prop({ type: PricingInfoSchema })
  @IsOptional()
  pricing?: PricingInfo;

  @ApiProperty({ description: 'Current stock status', enum: StockStatus })
  @Prop({ enum: Object.values(StockStatus), default: StockStatus.IN_STOCK })
  @IsEnum(StockStatus)
  stockStatus: StockStatus;

  @ApiProperty({ description: 'Whether item is currently active' })
  @Prop({ default: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Whether item is serialized/tracked individually',
  })
  @Prop({ default: false })
  @IsBoolean()
  isSerialized: boolean;

  @ApiProperty({
    description: 'Whether item is a service rather than physical item',
  })
  @Prop({ default: false })
  @IsBoolean()
  isService: boolean;

  @ApiProperty({ description: 'Whether item is a consumable' })
  @Prop({ default: false })
  @IsBoolean()
  isConsumable: boolean;

  @ApiProperty({ description: 'Shelf life in days (for items with expiry)' })
  @Prop({ min: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shelfLifeDays?: number;

  @ApiProperty({ description: 'Warranty period in months' })
  @Prop({ min: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  warrantyMonths?: number;

  @ApiProperty({ description: 'Storage requirements/conditions' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  storageRequirements?: string;

  @ApiProperty({ description: 'Safety/hazard information' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  safetyInfo?: string;

  @ApiProperty({ description: 'Image URLs' })
  @Prop({ type: [String], default: [] })
  @IsArray()
  imageUrls: string[];

  @ApiProperty({
    description: 'Document attachments (datasheets, manuals, etc.)',
  })
  @Prop({ type: [String], default: [] })
  @IsArray()
  attachments: string[];

  @ApiProperty({ description: 'QR code data for quick scanning' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  qrCode?: string;

  @ApiProperty({ description: 'Barcode' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ description: 'Additional notes' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Date when item was created' })
  @Prop({ default: Date.now })
  @IsDate()
  createdDate: Date;

  @ApiProperty({ description: 'Last modification date' })
  @Prop({ default: Date.now })
  @IsDate()
  lastModified: Date;

  @ApiProperty({ description: 'Total quantity across all locations' })
  totalStock?: number;

  @ApiProperty({ description: 'Total reserved quantity across all locations' })
  totalReserved?: number;

  @ApiProperty({ description: 'Total available quantity across all locations' })
  totalAvailable?: number;
}

export const InventoryItemSchema = SchemaFactory.createForClass(InventoryItem);

// ========================= INVENTORY TRANSACTION SCHEMA =========================

@Schema({ timestamps: true })
export class InventoryTransaction {
  @ApiProperty({ description: 'Transaction reference number' })
  @Prop()
  @IsString()
  transactionRef: string;

  @ApiProperty({ description: 'Inventory item involved' })
  @Prop({ type: Types.ObjectId, ref: 'InventoryItem', required: true })
  inventoryItem: Types.ObjectId;

  @ApiProperty({ description: 'Type of transaction', enum: TransactionType })
  @Prop({ required: true, enum: Object.values(TransactionType) })
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @ApiProperty({ description: 'Quantity involved in transaction' })
  @Prop({ required: true })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Unit price at time of transaction' })
  @Prop({ min: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @ApiProperty({ description: 'Total value of transaction' })
  @Prop({ min: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalValue?: number;

  @ApiProperty({ description: 'Source location' })
  @Prop({ type: Types.ObjectId, ref: 'StockLocation' })
  @IsOptional()
  fromLocation?: Types.ObjectId;

  @ApiProperty({ description: 'Destination location' })
  @Prop({ type: Types.ObjectId, ref: 'StockLocation' })
  @IsOptional()
  toLocation?: Types.ObjectId;

  @ApiProperty({ description: 'Related project (for allocations)' })
  @Prop({ type: Types.ObjectId, ref: 'Project' })
  @IsOptional()
  project?: Types.ObjectId;

  @ApiProperty({ description: 'Supplier (for purchases)' })
  @Prop({ type: Types.ObjectId, ref: 'Supplier' })
  @IsOptional()
  supplier?: Types.ObjectId;

  @ApiProperty({ description: 'User who performed the transaction' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  performedBy: Types.ObjectId;

  @ApiProperty({ description: 'Transaction date' })
  @Prop({ required: true, default: Date.now })
  @IsDate()
  transactionDate: Date;

  @ApiProperty({ description: 'Stock level before transaction' })
  @Prop({ min: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockBefore?: number;

  @ApiProperty({ description: 'Stock level after transaction' })
  @Prop({ min: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockAfter?: number;

  @ApiProperty({ description: 'Transaction notes/reason' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Document reference (invoice, receipt, etc.)' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  documentRef?: string;
}

export const InventoryTransactionSchema =
  SchemaFactory.createForClass(InventoryTransaction);

// Generate unique transaction reference if not provided
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

InventoryTransactionSchema.pre('save', function (next) {
  if (!this.transactionRef) {
    const date = new Date();
    const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '');
    const type = this.transactionType.substring(0, 3).toUpperCase();
    this.transactionRef = `TXN-${type}-${yyyymmdd}-${nanoid()}`;
  }
  next();
});

// ========================= VIRTUAL FIELDS AND MIDDLEWARE =========================

//Fields for stock calculations
InventoryItemSchema.virtual('totalStock').get(function () {
  return (
    this.stockLevels?.reduce((total, level) => total + level.currentStock, 0) ||
    0
  );
});

InventoryItemSchema.virtual('totalReserved').get(function () {
  return (
    this.stockLevels?.reduce(
      (total, level) => total + level.reservedStock,
      0,
    ) || 0
  );
});

InventoryItemSchema.virtual('totalAvailable').get(function () {
  return (
    this.stockLevels?.reduce(
      (total, level) => total + level.availableStock,
      0,
    ) || 0
  );
});

// Middleware to update stock status based on levels
InventoryItemSchema.pre('save', function () {
  const totalStock =
    this.stockLevels?.reduce((total, level) => total + level.currentStock, 0) ||
    0;
  const minLevel = Math.min(
    ...(this.stockLevels?.map((level) => level.minimumLevel) || [0]),
  );

  if (totalStock === 0) {
    this.stockStatus = StockStatus.OUT_OF_STOCK;
  } else if (totalStock <= minLevel) {
    this.stockStatus = StockStatus.LOW_STOCK;
  } else {
    this.stockStatus = StockStatus.IN_STOCK;
  }

  this.lastModified = new Date();
});

// Update available stock calculation
InventoryItemSchema.pre('save', function () {
  this.stockLevels?.forEach((level) => {
    // Ensure reservedStock is not null/undefined
    level.reservedStock = level.reservedStock || 0;
    // Ensure availableStock is never negative
    level.availableStock = Math.max(
      0,
      level.currentStock - level.reservedStock
    );
  });
});
