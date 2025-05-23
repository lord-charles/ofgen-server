import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { customAlphabet } from 'nanoid';


export enum SiteType {
  INDOOR = 'indoor',
  OUTDOOR = 'outdoor',
}

export enum LocationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export type LocationDocument = Location & Document;

@Schema({ timestamps: true })
export class Location {
  @ApiProperty({ description: 'Site name', example: 'Nairobi North Site' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'County where the site is located', example: 'Nairobi' })
  @Prop({ required: true })
  county: string;

  @ApiProperty({ description: 'Physical address of the site', example: '123 Solar Lane, Nairobi North' })
  @Prop()
  address: string;

  @ApiProperty({ description: 'Geographical coordinates', example: { lat: -1.2921, lng: 36.8219 } })
  @Prop({ type: Object })
  coordinates: {
    lat: number;
    lng: number;
  };

  @ApiProperty({ enum: SiteType, description: 'Type of site: indoor or outdoor', example: SiteType.OUTDOOR })
  @Prop({ required: true, enum: SiteType })
  siteType: SiteType;

  @ApiProperty({ description: 'User-input site ID', example: 'ABC-123', required: false })
  @Prop({ required: false, unique: true, sparse: true })
  siteId?: string;

  @ApiProperty({ description: 'System-generated unique site ID', example: 'OFGEN-20250523-XYZ123', readOnly: true })
  @Prop({ unique: true })
  systemSiteId?: string;

  @ApiProperty({ enum: LocationStatus, description: 'Site status', example: LocationStatus.ACTIVE, required: false })
  @Prop({ required: false, enum: LocationStatus, default: LocationStatus.ACTIVE })
  status?: LocationStatus;
}



const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

export const LocationSchema = SchemaFactory.createForClass(Location);

LocationSchema.pre('save', function (next) {
  if (!this.systemSiteId) {
    const date = new Date();
    const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '');
    this.systemSiteId = `OFGEN-${yyyymmdd}-${nanoid()}`;
  }
  next();
});
