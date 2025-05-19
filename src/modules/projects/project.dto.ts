import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsArray, IsMongoId, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MilestoneDto {
  @ApiProperty({ description: 'Title of the project milestone', example: 'Site Assessment' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Detailed description of the milestone', example: 'Initial site assessment and feasibility study' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Expected due date for the milestone (ISO date)', example: '2025-03-10' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ description: 'Date when the milestone was completed (ISO date)', example: '2025-03-09', required: false })
  @IsOptional()
  @IsDateString()
  completedDate?: string;

  @ApiProperty({ description: 'Current status of the milestone', example: 'Completed', enum: ['Pending', 'In Progress', 'Completed', 'Delayed'] })
  @IsString()
  status: string;
}

export class InventoryUsageDto {
  @ApiProperty({ description: 'Inventory item unique identifier', example: 'INV-1001' })
  @IsString()
  itemId: string;

  @ApiProperty({ description: 'Name of the inventory item used', example: 'Solar Panel 250W' })
  @IsString()
  itemName: string;

  @ApiProperty({ description: 'Quantity of the item used', example: 10 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Date the inventory item was used (ISO date)', example: '2025-03-12' })
  @IsDateString()
  dateUsed: string;

  @ApiProperty({ description: 'MongoDB ObjectId of the user who used the inventory item', example: '66500f0e8e5d7a001e8e4b11' })
  @IsMongoId()
  usedBy: string;
}

export class RiskDto {
  @ApiProperty({ description: 'Title of the project risk', example: 'Permit Issues' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Detailed description of the risk', example: 'Delays in obtaining permits from county authorities.' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Risk level', example: 'Medium', enum: ['Low', 'Medium', 'High', 'Critical'] })
  @IsString()
  level: string;

  @ApiProperty({ description: 'Current risk status', example: 'Open', enum: ['Open', 'Mitigated', 'Closed', 'Accepted'] })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Date the risk was identified (ISO date)', example: '2025-03-05' })
  @IsDateString()
  identifiedDate: string;

  @ApiProperty({ description: 'Mitigation plan for the risk', example: 'Engage county officials early.', required: false })
  @IsOptional()
  @IsString()
  mitigationPlan?: string;

  @ApiProperty({ description: 'Date the risk was resolved (ISO date)', example: '2025-03-15', required: false })
  @IsOptional()
  @IsDateString()
  resolvedDate?: string;

  @ApiProperty({ description: 'MongoDB ObjectId of the user responsible for the risk', example: '66500f0e8e5d7a001e8e4b12' })
  @IsMongoId()
  owner: string;
}

export class TaskDto {
  @ApiProperty({ description: 'Unique identifier for the task', example: 'OFGEN-1001-task-OFGEN-1001-m0-0' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Task title', example: 'Complete site survey' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Detailed description of the task', example: 'Survey the site and prepare assessment report.' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'MongoDB ObjectId of the user assigned to the task', example: '66500f0e8e5d7a001e8e4b11' })
  @IsMongoId()
  assignedTo: string;

  @ApiProperty({ description: 'Task due date (ISO date)', example: '2025-03-09' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ description: 'Current status of the task', example: 'Completed', enum: ['To Do', 'In Progress', 'Completed'] })
  @IsString()
  status: string;

  @ApiProperty({ description: 'ID of the related milestone', example: 'OFGEN-1001-m0' })
  @IsString()
  milestoneId: string;
}

export class CreateProjectDto {
  @ApiProperty({ description: 'Project name', example: 'Nairobi Solar Project Alpha' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'MongoDB ObjectId of the location/site', example: '682ba426e132f6e9290f1d19' })
  @IsMongoId()
  location: string;

  @ApiProperty({ description: 'County where the project is located', example: 'Nairobi' })
  @IsString()
  county: string;

  @ApiProperty({ description: 'Installed capacity of the project (e.g., in kW)', example: '5.50 kW' })
  @IsString()
  capacity: string;

  @ApiProperty({ description: 'Current status of the project', example: 'In Progress', enum: ['Planned', 'In Progress', 'On Hold', 'Completed'] })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Project start date (ISO date)', example: '2025-03-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Target completion date (ISO date)', example: '2025-06-15' })
  @IsDateString()
  targetCompletionDate: string;

  @ApiProperty({ description: 'Actual completion date (ISO date), if completed', example: '2025-06-10', required: false })
  @IsOptional()
  @IsDateString()
  actualCompletionDate?: string;

  @ApiProperty({ description: 'Overall project progress as a percentage', example: 56 })
  @IsNumber()
  progress: number;

  @ApiProperty({ description: 'List of project milestones', type: [MilestoneDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MilestoneDto)
  @IsOptional()
  milestones?: MilestoneDto[];

  @ApiProperty({ description: 'Inventory usage records for the project', type: [InventoryUsageDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryUsageDto)
  @IsOptional()
  inventoryUsage?: InventoryUsageDto[];

  @ApiProperty({ description: 'Risks associated with the project', type: [RiskDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RiskDto)
  @IsOptional()
  risks?: RiskDto[];

  @ApiProperty({ description: 'Tasks assigned within the project', type: [TaskDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskDto)
  @IsOptional()
  tasks?: TaskDto[];

  @ApiProperty({ description: 'Array of MongoDB ObjectIds for assigned team members (users)', type: [String], required: false })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  users?: string[];
}

export class UpdateProjectDto extends CreateProjectDto { }