import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNumber, IsDate, IsArray, Min, Max, IsBoolean } from 'class-validator';

export type ProjectDocument = Project & Document;
export type SubcontractorDocument = Subcontractor & Document;

// ========================= ENUMS =========================

export enum ProjectStatus {
  PLANNED = 'Planned',
  IN_PROGRESS = 'In Progress',
  ON_HOLD = 'On Hold',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export enum TaskStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  BLOCKED = 'Blocked',
  CANCELLED = 'Cancelled'
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum RiskSeverity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum SubcontractorSpecialty {
  CIVIL = 'Civil Works',
  ELECTRICAL = 'Electrical Installation',
  NETWORK = 'Network Configuration',
  MECHANICAL = 'Mechanical Installation',
  SECURITY = 'Security Systems',
  GENERAL = 'General Construction',
  TRANSPORT = 'Transportation & Logistics'
}

// ========================= SUBCONTRACTOR SCHEMA =========================

@Schema({ timestamps: true })
export class Subcontractor {
  @ApiProperty({ description: 'Subcontractor company name' })
  @Prop({ trim: true })
  @IsString()
  @IsOptional()
  companyName?: string;

  //
  @ApiProperty({ description: 'Is the subcontractor a company' })
  @Prop({ default: false })
  @IsBoolean()
  isCompany: boolean;

  @ApiProperty({ description: 'Primary contact person name' })
  @Prop({ trim: true })
  @IsString()
  @IsOptional()
  contactPerson?: string;

  @ApiProperty({ description: 'Contact email address' })
  @Prop({ lowercase: true, trim: true })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Primary phone number' })
  @Prop({ trim: true })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Company physical address' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Current rating/performance score (1-5)' })
  @Prop({ min: 1, max: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({ description: 'Whether subcontractor is currently active' })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Additional notes about the subcontractor' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

export const SubcontractorSchema = SchemaFactory.createForClass(Subcontractor);


@Schema({ timestamps: true })
export class Task {
  @ApiProperty({ description: 'Task name' })
  @Prop({ required: true, trim: true })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Detailed task description' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Subcontractor assigned to execute this task' })
  @Prop({ type: Types.ObjectId, ref: 'Subcontractor' })
  @IsOptional()
  assignedSubcontractor?: Types.ObjectId;

  @ApiProperty({ description: 'Current task status', enum: TaskStatus })
  @Prop({ required: true, enum: Object.values(TaskStatus), default: TaskStatus.PENDING })
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @ApiProperty({ description: 'Task priority level', enum: TaskPriority })
  @Prop({ enum: Object.values(TaskPriority), default: TaskPriority.MEDIUM })
  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @ApiProperty({ description: 'Planned start date' })
  @Prop()
  @IsOptional()
  @IsDate()
  plannedStartDate?: Date;

  @ApiProperty({ description: 'Planned end date' })
  @Prop()
  @IsOptional()
  @IsDate()
  plannedEndDate?: Date;

  @ApiProperty({ description: 'Actual start date' })
  @Prop()
  @IsOptional()
  @IsDate()
  actualStartDate?: Date;

  @ApiProperty({ description: 'Actual completion date' })
  @Prop()
  @IsOptional()
  @IsDate()
  actualEndDate?: Date;

  @ApiProperty({ description: 'Task progress percentage (0-100)' })
  @Prop({ default: 0, min: 0, max: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @ApiProperty({ description: 'Additional notes or comments' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

const TaskSchema = SchemaFactory.createForClass(Task);

@Schema({ _id: false })
export class Milestone {
  @ApiProperty({ description: 'Milestone name' })
  @Prop({ required: true, trim: true })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Milestone description' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Target completion date' })
  @Prop({ required: true })
  @IsDate()
  dueDate: Date;

  @ApiProperty({ description: 'Actual completion date' })
  @Prop()
  @IsOptional()
  @IsDate()
  completedDate?: Date;

  @ApiProperty({ description: 'Milestone progress percentage (0-100)' })
  @Prop({ default: 0, min: 0, max: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @ApiProperty({ description: 'Tasks associated with this milestone', type: [Task] })
  @Prop({ type: [TaskSchema], default: [] })
  @IsArray()
  tasks: Task[];

  @ApiProperty({ description: 'Milestone deliverables' })
  @Prop({ type: [String], default: [] })
  @IsArray()
  deliverables: string[];
}

const MilestoneSchema = SchemaFactory.createForClass(Milestone);

@Schema({ _id: false })
export class RiskItem {
  @ApiProperty({ description: 'Risk title' })
  @Prop({ required: true, trim: true })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Detailed risk description' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Risk severity level', enum: RiskSeverity })
  @Prop({ required: true, enum: Object.values(RiskSeverity) })
  @IsEnum(RiskSeverity)
  severity: RiskSeverity;

  @ApiProperty({ description: 'Probability of risk occurrence (0-1)' })
  @Prop({ min: 0, max: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  probability?: number;

  @ApiProperty({ description: 'Potential impact (1-10)' })
  @Prop({ min: 1, max: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  impact?: number;

  @ApiProperty({ description: 'Risk mitigation plan' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  mitigationPlan?: string;

  @ApiProperty({ description: 'Person responsible for managing this risk' })
  @Prop({ type: Types.ObjectId, ref: 'User' })
  @IsOptional()
  owner?: Types.ObjectId;

  @ApiProperty({ description: 'Current status of risk mitigation' })
  @Prop({ trim: true, default: 'Open' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Date risk was identified' })
  @Prop({ default: Date.now })
  @IsDate()
  identifiedDate: Date;

  @ApiProperty({ description: 'Target date for risk resolution' })
  @Prop()
  @IsOptional()
  @IsDate()
  targetResolutionDate?: Date;

  @ApiProperty({ description: 'Additional notes or comments' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

const RiskItemSchema = SchemaFactory.createForClass(RiskItem);


// ========================= MAIN PROJECT SCHEMA =========================

@Schema({ timestamps: true })
export class Project {
  @ApiProperty({ description: 'Project name/title' })
  @Prop({ required: true, trim: true })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Project reference/code' })
  @Prop({ required: true, unique: true, trim: true })
  @IsString()
  projectCode: string;

  @ApiProperty({ description: 'Linked Safaricom service order ID' })
  @Prop({ type: Types.ObjectId, ref: 'ServiceOrder', required: true })
  serviceOrder: Types.ObjectId;

  // ============= OFGEN TEAM STRUCTURE =============

  @ApiProperty({ description: 'Ofgen project leader responsible for overall project management' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  projectLeader: Types.ObjectId;

  @ApiProperty({ description: 'Subcontractors assigned to execute project tasks' })
  @Prop({ type: [Types.ObjectId], ref: 'Subcontractor', default: [] })
  @IsArray()
  subcontractors: Types.ObjectId[];

  // ============= PROJECT DETAILS =============

  @ApiProperty({ description: 'Project location/site reference' })
  @Prop({ type: Types.ObjectId, ref: 'Location', required: true })
  location: Types.ObjectId;

  @ApiProperty({ description: 'Site/installation capacity' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  capacity?: string;

  @ApiProperty({ description: 'Type of project (Tower Installation, Network Upgrade, etc.)' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  projectType?: string;

  @ApiProperty({ description: 'Current project status', enum: ProjectStatus })
  @Prop({ required: true, enum: Object.values(ProjectStatus), default: ProjectStatus.PLANNED })
  @IsEnum(ProjectStatus)
  status: ProjectStatus;

  // ============= TIMELINE =============

  @ApiProperty({ description: 'Planned project start date' })
  @Prop()
  @IsOptional()
  @IsDate()
  plannedStartDate?: Date;

  @ApiProperty({ description: 'Target completion date as per contract' })
  @Prop()
  @IsOptional()
  @IsDate()
  targetCompletionDate?: Date;

  @ApiProperty({ description: 'Actual project start date' })
  @Prop()
  @IsOptional()
  @IsDate()
  actualStartDate?: Date;

  @ApiProperty({ description: 'Actual project completion date' })
  @Prop()
  @IsOptional()
  @IsDate()
  actualCompletionDate?: Date;

  @ApiProperty({ description: 'Overall project progress percentage (0-100)' })
  @Prop({ default: 0, min: 0, max: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  // ============= PROJECT STRUCTURE =============

  @ApiProperty({ description: 'Project milestones', type: [Milestone] })
  @Prop({ type: [MilestoneSchema], default: [] })
  @IsArray()
  milestones: Milestone[];

  @ApiProperty({ description: 'Project risks and mitigation plans', type: [RiskItem] })
  @Prop({ type: [RiskItemSchema], default: [] })
  @IsArray()
  risks: RiskItem[];

  // ============= ADDITIONAL METADATA =============

  @ApiProperty({ description: 'Project priority level', enum: TaskPriority })
  @Prop({ enum: Object.values(TaskPriority), default: TaskPriority.MEDIUM })
  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @ApiProperty({ description: 'Contract value from Safaricom' })
  @Prop({ min: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  contractValue?: number;

  @ApiProperty({ description: 'Project description and scope' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Additional project notes' })
  @Prop({ trim: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Whether project is currently active' })
  @Prop({ default: true })
  isActive: boolean;

  // Computed fields (virtual or calculated)
  @ApiProperty({ description: 'Number of days since project started' })
  daysInProgress?: number;

  @ApiProperty({ description: 'Number of days remaining until target completion' })
  daysRemaining?: number;

  @ApiProperty({ description: 'Whether project is behind schedule' })
  isBehindSchedule?: boolean;


}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// virtual fields and middleware
ProjectSchema.virtual('daysInProgress').get(function () {
  if (!this.actualStartDate) return 0;
  return Math.floor((Date.now() - this.actualStartDate.getTime()) / (1000 * 60 * 60 * 24));
});

ProjectSchema.virtual('daysRemaining').get(function () {
  if (!this.targetCompletionDate) return null;
  return Math.floor((this.targetCompletionDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
});

ProjectSchema.virtual('isBehindSchedule').get(function () {
  if (!this.targetCompletionDate || this.status === ProjectStatus.COMPLETED) return false;
  return Date.now() > this.targetCompletionDate.getTime();
});

