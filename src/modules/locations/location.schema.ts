import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

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
}

export const LocationSchema = SchemaFactory.createForClass(Location);
