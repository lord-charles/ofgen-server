import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsArray,
  IsMongoId,
  IsNumber,
  ValidateNested,
  IsEnum,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ProjectStatus,
  TaskStatus,
  TaskPriority,
  RiskSeverity,
  SubcontractorSpecialty,
} from './project.schema';

// Base DTO for common fields
export class CreateSubcontractorDto {
  // Common fields for both companies and individuals
  @ApiProperty({ description: 'Is the subcontractor a company', example: true })
  @IsBoolean()
  isCompany: boolean;

  @ApiProperty({
    description: 'Email address',
    example: 'info@nairobielec.co.ke',
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Phone number', example: '+254712345678' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Physical address',
    example: 'Kimathi Street, Nairobi CBD',
  })
  @IsString()
  @IsOptional()
  address?: string;

  // Company-specific fields
  @ApiProperty({
    description: 'Company name (when isCompany=true)',
    example: 'Nairobi Electrical Solutions Ltd',
  })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiProperty({
    description: 'Company registration number (when isCompany=true)',
    example: 'KE-C-123456',
  })
  @IsString()
  @IsOptional()
  registrationNumber?: string;

  @ApiProperty({
    description: 'KRA PIN (when isCompany=true)',
    example: 'A123456789B',
  })
  @IsString()
  @IsOptional()
  taxPin?: string;

  @ApiProperty({
    description: 'Primary contact person name (when isCompany=true)',
    example: 'John Kamau',
  })
  @IsString()
  @IsOptional()
  contactPerson?: string;

  // Individual-specific fields
  @ApiProperty({
    description: 'First name (when isCompany=false)',
    example: 'John',
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'Last name (when isCompany=false)',
    example: 'Kamau',
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'National ID number (when isCompany=false)',
    example: '12345678',
  })
  @IsString()
  @IsOptional()
  nationalId?: string;

  // Specialty and skills
  @ApiProperty({
    description: 'Specialty/expertise area',
    enum: SubcontractorSpecialty,
    example: SubcontractorSpecialty.ELECTRICAL,
  })
  @IsEnum(SubcontractorSpecialty)
  @IsOptional()
  specialty?: SubcontractorSpecialty;

  @ApiProperty({
    description: 'Additional skills or certifications',
    example: ['Solar PV Installation', 'Electrical Wiring'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  // Status
  @ApiProperty({
    description: 'Whether subcontractor is currently active',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Additional notes about the subcontractor',
    example:
      'Reliable electrical contractor with experience in solar installations across Kenya.',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateSubcontractorDto extends CreateSubcontractorDto {}

export class SubcontractorDto extends CreateSubcontractorDto {
  @ApiProperty({
    description: 'MongoDB ObjectId of the subcontractor',
    example: '6450ab3c2c4e1a8f9c8b4567',
  })
  @IsMongoId()
  _id: string;

  @ApiProperty({ description: 'Performance rating (1-5)', example: 4.5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiProperty({
    description: 'Creation date',
    example: '2025-05-20T09:15:00.000Z',
  })
  @IsDateString()
  createdAt: string;

  @ApiProperty({
    description: 'Last update date',
    example: '2025-05-25T14:30:00.000Z',
  })
  @IsDateString()
  updatedAt: string;
}

// DTO for the basic contact information response
export class SubcontractorContactDto {
  @ApiProperty({
    description: 'MongoDB ObjectId of the subcontractor',
    example: '6450ab3c2c4e1a8f9c8b4567',
  })
  @IsMongoId()
  _id: string;

  @ApiProperty({ description: 'Is the subcontractor a company', example: true })
  @IsBoolean()
  isCompany: boolean;

  @ApiProperty({
    description: 'Email address',
    example: 'info@nairobielec.co.ke',
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Phone number', example: '+254712345678' })
  @IsString()
  @IsOptional()
  phone?: string;

  // Company-specific fields
  @ApiProperty({
    description: 'Company name (when isCompany=true)',
    example: 'Nairobi Electrical Solutions Ltd',
  })
  @IsString()
  @IsOptional()
  companyName?: string;

  // Individual-specific fields
  @ApiProperty({
    description: 'First name (when isCompany=false)',
    example: 'John',
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'Last name (when isCompany=false)',
    example: 'Kamau',
  })
  @IsString()
  @IsOptional()
  lastName?: string;
}

export class TaskDto {
  @ApiProperty({
    description: 'Task name',
    example: 'Install Solar Panels at Kitengela Site',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Detailed task description',
    example:
      'Mount and secure 20 solar panels on the rooftop structure as per the design specifications.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Subcontractor assigned to execute this task',
    example: '6450ab3c2c4e1a8f9c8b4567',
  })
  @IsMongoId()
  @IsOptional()
  assignedSubcontractor?: string;

  @ApiProperty({
    description: 'Current task status',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @ApiProperty({
    description: 'Task priority level',
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @ApiProperty({
    description: 'Planned start date',
    example: '2025-06-01T09:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  plannedStartDate?: string;

  @ApiProperty({
    description: 'Planned end date',
    example: '2025-06-05T17:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  plannedEndDate?: string;

  @ApiProperty({
    description: 'Actual start date',
    example: '2025-06-02T10:30:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  actualStartDate?: string;

  @ApiProperty({
    description: 'Actual completion date',
    example: '2025-06-06T16:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  actualEndDate?: string;

  @ApiProperty({ description: 'Task progress percentage (0-100)', example: 75 })
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @ApiProperty({
    description: 'Additional notes or comments',
    example: 'Delayed by one day due to rain in Kitengela area.',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class MilestoneDto {
  @ApiProperty({
    description: 'Milestone name',
    example: 'Site Preparation and Foundation',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Milestone description',
    example:
      'Complete all ground preparation work and foundation for the solar installation at Kitengela site.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Target completion date',
    example: '2025-06-15T17:00:00.000Z',
  })
  @IsDateString()
  dueDate: string;

  @ApiProperty({
    description: 'Actual completion date',
    example: '2025-06-14T15:30:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  completedDate?: string;

  @ApiProperty({
    description: 'Milestone progress percentage (0-100)',
    example: 85,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @ApiProperty({
    description: 'Tasks associated with this milestone',
    type: [TaskDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskDto)
  tasks: TaskDto[];

  @ApiProperty({
    description: 'Milestone deliverables',
    example: ['Foundation completion report', 'Site readiness certificate'],
  })
  @IsArray()
  @IsString({ each: true })
  deliverables: string[];
}

export class RiskItemDto {
  @ApiProperty({
    description: 'Risk title',
    example: 'Delayed Equipment Delivery',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Detailed risk description',
    example:
      'Potential delay in delivery of solar panels from Mombasa port to Kitengela site.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Risk severity level',
    enum: RiskSeverity,
    example: RiskSeverity.MEDIUM,
  })
  @IsEnum(RiskSeverity)
  severity: RiskSeverity;

  @ApiProperty({
    description: 'Probability of risk occurrence (0-1)',
    example: 0.4,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  probability?: number;

  @ApiProperty({ description: 'Potential impact (1-10)', example: 7 })
  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  impact?: number;

  @ApiProperty({
    description: 'Risk mitigation plan',
    example:
      'Arrange alternative transportation and establish buffer inventory at Nairobi warehouse.',
  })
  @IsString()
  @IsOptional()
  mitigationPlan?: string;

  @ApiProperty({
    description: 'Person responsible for managing this risk',
    example: '6450ab3c2c4e1a8f9c8b4569',
  })
  @IsMongoId()
  @IsOptional()
  owner?: string;

  @ApiProperty({
    description: 'Current status of risk mitigation',
    example: 'Open',
    enum: ['Open', 'Mitigated', 'Closed', 'Accepted'],
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'Date risk was identified',
    example: '2025-05-20T09:15:00.000Z',
  })
  @IsDateString()
  identifiedDate: string;

  @ApiProperty({
    description: 'Target date for risk resolution',
    example: '2025-05-30T17:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  targetResolutionDate?: string;

  @ApiProperty({
    description: 'Additional notes or comments',
    example: 'Monitoring shipping status daily with logistics partner.',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateProjectDto {
  @ApiProperty({
    description: 'Project name/title',
    example: 'Kitengela Solar Power Installation',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  // @ApiProperty({
  //   description: 'Linked Safaricom service order ID',
  //   example: '6450ab3c2c4e1a8f9c8b4570',
  // })
  // @IsMongoId()
  // serviceOrder: string;

  // ============= OFGEN TEAM STRUCTURE =============

  @ApiProperty({
    description:
      'Ofgen project leader responsible for overall project management',
    example: '6450ab3c2c4e1a8f9c8b4571',
  })
  @IsMongoId()
  @IsOptional()
  projectLeader?: string;

  @ApiProperty({
    description: 'Subcontractors assigned to execute project tasks',
    example: ['6450ab3c2c4e1a8f9c8b4572', '6450ab3c2c4e1a8f9c8b4573'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  subcontractors?: string[];

  @ApiProperty({
    description: 'Subcontractor contacts',
    example: [
      { firstName: 'John', lastName: 'Doe' },
      { firstName: 'Jane', lastName: 'Smith' },
    ],
  })
  @IsArray()
  @IsOptional()
  additionalSubcontractors?: { firstName: string; lastName: string }[];

  @ApiProperty({
    description: 'Linked Safaricom service order URL',
    example: 'https://safaricom.com/service-order/6450ab3c2c4e1a8f9c8b4575',
  })
  @IsString()
  @IsOptional()
  serviceOrderUrl?: string;

  // ============= PROJECT DETAILS =============

  @ApiProperty({
    description: 'Project location/site reference',
    example: '6450ab3c2c4e1a8f9c8b4574',
  })
  @IsMongoId()
  location: string;

  @ApiProperty({ description: 'Site/installation capacity', example: '25 kW' })
  @IsString()
  @IsOptional()
  capacity?: string;

  @ApiProperty({
    description: 'Type of project (Tower Installation, Network Upgrade, etc.)',
    example: 'Solar Power Installation',
  })
  @IsString()
  @IsOptional()
  projectType?: string;

  @ApiProperty({
    description: 'Current project status',
    enum: ProjectStatus,
    example: ProjectStatus.IN_PROGRESS,
  })
  @IsEnum(ProjectStatus)
  status: ProjectStatus;

  // ============= TIMELINE =============

  @ApiProperty({
    description: 'Planned project start date',
    example: '2025-06-01T08:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  plannedStartDate?: string;

  @ApiProperty({
    description: 'Target completion date as per contract',
    example: '2025-08-15T17:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  targetCompletionDate?: string;

  @ApiProperty({
    description: 'Actual project start date',
    example: '2025-06-03T09:30:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  actualStartDate?: string;

  @ApiProperty({
    description: 'Actual project completion date',
    example: '2025-08-20T16:45:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  actualCompletionDate?: string;

  @ApiProperty({
    description: 'Overall project progress percentage (0-100)',
    example: 65,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  // ============= PROJECT STRUCTURE =============

  @ApiProperty({ description: 'Project milestones', type: [MilestoneDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MilestoneDto)
  @IsOptional()
  milestones?: MilestoneDto[];

  @ApiProperty({
    description: 'Project risks and mitigation plans',
    type: [RiskItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RiskItemDto)
  @IsOptional()
  risks?: RiskItemDto[];

  // ============= ADDITIONAL METADATA =============

  @ApiProperty({
    description: 'Project priority level',
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiProperty({
    description: 'Contract value from Safaricom',
    example: 3500000,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  contractValue?: number;

  @ApiProperty({
    description: 'Project description and scope',
    example:
      "Installation of 25kW solar power system at Safaricom's Kitengela site to provide backup power and reduce grid dependency.",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Additional project notes',
    example:
      "This is a high-priority installation for Safaricom's new 5G infrastructure.",
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Whether project is currently active',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;
}

export class UpdateProjectDto extends CreateProjectDto {}
