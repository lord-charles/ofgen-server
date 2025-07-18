import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type ServiceOrderDocument = ServiceOrder & Document;

@Schema()
export class ContactInfo {
  @ApiProperty({ description: 'Contact person name' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'Phone number' })
  @Prop({ required: true })
  telephone: string;

  @ApiProperty({ description: 'Email address' })
  @Prop({ required: true })
  email: string;

  @ApiProperty({ description: 'Physical address' })
  @Prop({ required: true })
  physicalAddress: string;
}

@Schema()
export class LocationInfo {
  @ApiProperty({ description: 'Region' })
  @Prop({ required: true })
  region: string;

  @ApiProperty({ description: 'Sub region' })
  @Prop({ required: true })
  subRegion: string;

  @ApiProperty({ description: 'GPS coordinates' })
  @Prop({
    type: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
  })
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

@Schema()
export class SiteDetails {
  @ApiProperty({ description: 'Site ID' })
  @Prop({ required: true, unique: true })
  siteId: string;

  @ApiPropertyOptional({ description: 'Site type' })
  @Prop()
  siteType?: string;

  @ApiPropertyOptional({ description: 'Site classification' })
  @Prop()
  siteClassification?: string;
}

@Schema()
export class BillOfMaterialsItem {
  @ApiProperty({ description: 'Item name' })
  @Prop({ required: true })
  item: string;

  @ApiProperty({ description: 'Specifications/Capacity' })
  @Prop()
  specs: string;

  @ApiProperty({ description: 'Unit of measure' })
  @Prop()
  unitOfMeasure: string;

  @ApiProperty({ description: 'Quantity' })
  @Prop({ required: true, min: 0 })
  quantity: number;

  @ApiPropertyOptional({ description: 'Rate/Price per unit' })
  @Prop({ min: 0 })
  rate?: number;

  @ApiPropertyOptional({ description: 'Selling rate/price per unit' })
  @Prop({ min: 0 })
  sellingRate?: number;

  @ApiProperty({ description: 'BOM type' })
  @Prop()
  bomType: 'Equipment' | 'Service';

  @ApiPropertyOptional({ description: 'Total cost' })
  @Prop({ min: 0 })
  total?: number;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @Prop()
  notes?: string;
}

@Schema({ timestamps: true })
export class ServiceOrder {
  @ApiProperty({ description: 'Issuer organization' })
  @Prop({ required: true })
  issuedBy: string;

  @ApiProperty({ description: 'Recipient organization' })
  @Prop({ required: true })
  issuedTo: string;

  @ApiProperty({ description: 'Service order date' })
  @Prop({ required: true })
  serviceOrderDate: Date;

  @ApiProperty({ description: 'Contact information' })
  @Prop({ type: ContactInfo, required: true })
  contactInfo: ContactInfo;

  @ApiProperty({ description: 'Location information' })
  @Prop({ type: LocationInfo, required: true })
  locationInfo: LocationInfo;

  @ApiProperty({ description: 'Site details' })
  @Prop({ type: SiteDetails, required: true })
  siteDetails: SiteDetails;

  @ApiProperty({
    description: 'Dynamic design summary fields',
    type: 'object',
    additionalProperties: true,
  })
  @Prop({
    type: MongooseSchema.Types.Mixed,
    default: {},
  })
  designSummary: Record<string, any>;

  @ApiProperty({
    description: 'Bill of materials items',
    type: [BillOfMaterialsItem],
  })
  @Prop({ type: [BillOfMaterialsItem], default: [] })
  billOfMaterials: BillOfMaterialsItem[];

  @ApiPropertyOptional({ description: 'Order status' })
  @Prop({
    enum: ['draft', 'pending', 'approved', 'rejected', 'completed'],
    default: 'draft',
  })
  status?: string;

  @ApiPropertyOptional({ description: 'Total order value' })
  @Prop({ min: 0 })
  totalValue?: number;

  @ApiPropertyOptional({ description: 'Additional comments' })
  @Prop()
  comments?: string;

  @ApiPropertyOptional({ description: 'Approval information' })
  @Prop({
    type: {
      approvedBy: String,
      approvedDate: Date,
      approvalComments: String,
    },
  })
  approval?: {
    approvedBy: string;
    approvedDate: Date;
    approvalComments?: string;
  };

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

export const ServiceOrderSchema = SchemaFactory.createForClass(ServiceOrder);

ServiceOrderSchema.index({ 'siteDetails.siteId': 1 });
ServiceOrderSchema.index({ status: 1 });
ServiceOrderSchema.index({ serviceOrderDate: -1 });
ServiceOrderSchema.index({ issuedBy: 1, issuedTo: 1 });
