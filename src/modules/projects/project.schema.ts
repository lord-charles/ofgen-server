import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @ApiProperty({ description: 'Project name', example: 'Nairobi Solar Project Alpha' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'Reference to location/site', type: String })
  @Prop({ type: Types.ObjectId, ref: 'Location', required: true })
  location: Types.ObjectId;

  @ApiProperty({ description: 'County', example: 'Nairobi' })
  @Prop({ required: true })
  county: string;

  @ApiProperty({ description: 'Capacity of the project', example: '5.50 kW' })
  @Prop()
  capacity: string;

  @ApiProperty({ description: 'Project status', enum: ['Planned', 'In Progress', 'On Hold', 'Completed'] })
  @Prop({ required: true })
  status: string;

  @ApiProperty({ description: 'Project start date', example: '2025-03-01' })
  @Prop()
  startDate: Date;

  @ApiProperty({ description: 'Target completion date', example: '2025-06-15' })
  @Prop()
  targetCompletionDate: Date;

  @ApiProperty({ description: 'Actual completion date', example: '2025-06-10', required: false })
  @Prop()
  actualCompletionDate?: Date;

  @ApiProperty({ description: 'Progress percentage', example: 56 })
  @Prop({ default: 0 })
  progress: number;

  @ApiProperty({ description: 'Milestones for the project', type: [Object] })
  @Prop({ type: [Object], default: [] })
  milestones: any[];

  @ApiProperty({ description: 'Inventory usage for the project', type: [Object] })
  @Prop({ type: [Object], default: [] })
  inventoryUsage: any[];

  @ApiProperty({ description: 'Risks for the project', type: [Object] })
  @Prop({ type: [Object], default: [] })
  risks: any[];

  @ApiProperty({ description: 'Tasks for the project', type: [Object] })
  @Prop({ type: [Object], default: [] })
  tasks: any[];

  @ApiProperty({ description: 'Team members (user _ids)', type: [String] })
  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  users: Types.ObjectId[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
