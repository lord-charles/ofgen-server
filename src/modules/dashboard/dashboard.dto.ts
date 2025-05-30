import { ApiProperty } from '@nestjs/swagger';

// Overview DTO
export class OverviewDto {
  @ApiProperty({ description: 'Total number of projects', example: 24 })
  totalProjects: number;

  @ApiProperty({ description: 'Number of active projects', example: 16 })
  activeProjects: number;

  @ApiProperty({ description: 'Number of completed projects', example: 6 })
  completedProjects: number;

  @ApiProperty({ description: 'Number of projects on hold', example: 2 })
  onHoldProjects: number;

  @ApiProperty({ description: 'Total contract value across all projects', example: 125000000 })
  totalContractValue: number;

  @ApiProperty({ description: 'Revenue for the current month', example: 8500000 })
  monthlyRevenue: number;

  @ApiProperty({ description: 'Total number of locations/sites', example: 32 })
  totalLocations: number;

  @ApiProperty({ description: 'Number of active subcontractors', example: 48 })
  activeSubcontractors: number;

  @ApiProperty({ description: 'Number of pending service orders', example: 12 })
  pendingServiceOrders: number;

  @ApiProperty({ description: 'Project completion rate percentage', example: 87.5 })
  completionRate: number;

  @ApiProperty({ description: 'Average duration of projects in days', example: 45 })
  avgProjectDuration: number;

  @ApiProperty({ description: 'Average client satisfaction rating', example: 4.8 })
  clientSatisfaction: number;

  @ApiProperty({ description: 'Average profit margin percentage', example: 18.5 })
  profitMargin: number;
}

// Project DTO
export class ProjectDto {
  @ApiProperty({ description: 'Project ID', example: '68364344c6037367c6987339' })
  id: string;

  @ApiProperty({ description: 'Project name', example: 'Kitengela Solar Power Installation' })
  name: string;

  @ApiProperty({ description: 'Project status', example: 'In Progress' })
  status: string;

  @ApiProperty({ description: 'Project progress percentage', example: 75 })
  progress: number;

  @ApiProperty({ description: 'Contract value', example: 3500000 })
  contractValue: number;

  @ApiProperty({ description: 'Target completion date', example: '2025-08-15' })
  targetCompletion: string;

  @ApiProperty({ description: 'Actual start date', example: '2025-06-03' })
  actualStart: string | null;

  @ApiProperty({ description: 'Location name', example: 'Nairobi North Site' })
  location: string;

  @ApiProperty({ description: 'Project priority', example: 'High' })
  priority: string;

  @ApiProperty({ description: 'Project leader name', example: 'Charles Mihunyo' })
  projectLeader: string;

  @ApiProperty({ description: 'Client name', example: 'SAFARICOM PLC' })
  client: string;

  @ApiProperty({ description: 'Project capacity', example: '25 kW' })
  capacity: string;

  @ApiProperty({ description: 'Project type', example: 'Solar Power Installation' })
  type: string;

  @ApiProperty({ description: 'Total number of milestones', example: 4 })
  milestones: number;

  @ApiProperty({ description: 'Number of completed milestones', example: 3 })
  completedMilestones: number;

  @ApiProperty({ description: 'Number of identified risks', example: 2 })
  risks: number;

  @ApiProperty({ description: 'Team size', example: 8 })
  team: number;
}

// Location DTO
export class LocationDto {
  @ApiProperty({ description: 'Location ID', example: '6831244be51eb38688fe84bb' })
  id: string;

  @ApiProperty({ description: 'Location name', example: 'Nairobi North Site' })
  name: string;

  @ApiProperty({ description: 'County', example: 'Nairobi' })
  county: string;

  @ApiProperty({ description: 'Region', example: 'Central' })
  region: string;

  @ApiProperty({ description: 'Status of the location', example: 'active' })
  status: string;

  @ApiProperty({ description: 'Type of site', example: 'outdoor' })
  siteType: string;

  @ApiProperty({ description: 'Number of projects at this location', example: 3 })
  projectsCount: number;

  @ApiProperty({ description: 'GPS coordinates', example: { lat: -1.2921, lng: 36.8219 } })
  coordinates: { lat: number; lng: number };

  @ApiProperty({ description: 'Total capacity', example: '75 kW' })
  capacity: string;

  @ApiProperty({ description: 'Utilization percentage', example: 85 })
  utilization: number;
}

// Service Order DTO
export class ServiceOrderDto {
  @ApiProperty({ description: 'Service order ID', example: '6835b53a4163f41c4997c2bb' })
  id: string;

  @ApiProperty({ description: 'Issuing organization', example: 'AIRTEL KENYA' })
  issuedBy: string;

  @ApiProperty({ description: 'Recipient organization', example: 'OFGEN LTD' })
  issuedTo: string;

  @ApiProperty({ description: 'Status of the service order', example: 'approved' })
  status: string;

  @ApiProperty({ description: 'Date the service order was issued', example: '2025-05-14' })
  serviceOrderDate: string;

  @ApiProperty({ description: 'Region', example: 'NYANZA' })
  region: string;

  @ApiProperty({ description: 'Total value of the service order', example: 4200000 })
  totalValue: number;

  @ApiProperty({ description: 'Priority level', example: 'High' })
  priority: string;

  @ApiProperty({ description: 'Due date for completion', example: '2025-06-30' })
  dueDate: string;
}

// Subcontractor DTO
export class SubcontractorDto {
  @ApiProperty({ description: 'Subcontractor ID', example: '6837732a0407ba48dbb74011' })
  id: string;

  @ApiProperty({ description: 'Name', example: 'Charles Mwaniki' })
  name: string;

  @ApiProperty({ description: 'Type (individual or company)', example: 'individual' })
  type: string;

  @ApiProperty({ description: 'Area of specialty', example: 'Civil Works' })
  specialty: string;

  @ApiProperty({ description: 'Current status', example: 'active' })
  status: string;

  @ApiProperty({ description: 'Performance rating', example: 4.5 })
  rating: number;

  @ApiProperty({ description: 'Number of projects currently assigned', example: 3 })
  projectsAssigned: number;

  @ApiProperty({ description: 'Task completion rate percentage', example: 95 })
  completionRate: number;

  @ApiProperty({ description: 'Location', example: 'Nairobi' })
  location: string;
}

// Risk DTO
export class RiskDto {
  @ApiProperty({ description: 'Risk ID', example: '1' })
  id: string;

  @ApiProperty({ description: 'Risk title', example: 'Delayed Equipment Delivery' })
  title: string;

  @ApiProperty({ description: 'Risk description', example: 'Potential delay in delivery of solar panels from Mombasa port' })
  description: string;

  @ApiProperty({ description: 'Risk severity', example: 'Medium' })
  severity: string;

  @ApiProperty({ description: 'Probability of occurrence (0-1)', example: 0.4 })
  probability: number;

  @ApiProperty({ description: 'Impact level (1-10)', example: 7 })
  impact: number;

  @ApiProperty({ description: 'Current status', example: 'Open' })
  status: string;

  @ApiProperty({ description: 'Risk owner', example: 'Charles Mihunyo' })
  owner: string;

  @ApiProperty({ description: 'Associated project', example: 'Kitengela Solar Power Installation' })
  project: string;

  @ApiProperty({ description: 'Date risk was identified', example: '2025-05-20' })
  identifiedDate: string;

  @ApiProperty({ description: 'Target resolution date', example: '2025-05-30' })
  targetResolution: string;
}

// Activity DTO
export class ActivityDto {
  @ApiProperty({ description: 'Activity ID', example: '1' })
  id: string;

  @ApiProperty({ description: 'Activity type', example: 'project_update' })
  type: string;

  @ApiProperty({ description: 'Activity title', example: 'Kitengela Solar Installation - Milestone Completed' })
  title: string;

  @ApiProperty({ description: 'Activity description', example: 'Site preparation and foundation work completed ahead of schedule' })
  description: string;

  @ApiProperty({ description: 'Timestamp of activity', example: '2025-05-29T14:30:00Z' })
  timestamp: string;

  @ApiProperty({ description: 'User who performed or is associated with the activity', example: 'Charles Mihunyo' })
  user: string;

  @ApiProperty({ description: 'Priority level of the activity', example: 'normal' })
  priority: string;
}

// Monthly Revenue DTO
export class MonthlyRevenueDto {
  @ApiProperty({ description: 'Month', example: 'Jan' })
  month: string;

  @ApiProperty({ description: 'Revenue amount', example: 6500000 })
  revenue: number;

  @ApiProperty({ description: 'Target revenue', example: 7000000 })
  target: number;
}

// Project Value DTO
export class ProjectValueDto {
  @ApiProperty({ description: 'Project status', example: 'Completed' })
  status: string;

  @ApiProperty({ description: 'Total value of projects in this status', example: 16800000 })
  value: number;
}

// Expenses DTO
export class ExpensesDto {
  @ApiProperty({ description: 'Material costs', example: 35000000 })
  materials: number;

  @ApiProperty({ description: 'Labor costs', example: 18000000 })
  labor: number;

  @ApiProperty({ description: 'Equipment costs', example: 12000000 })
  equipment: number;

  @ApiProperty({ description: 'Overhead costs', example: 8500000 })
  overhead: number;
}

// Financials DTO
export class FinancialsDto {
  @ApiProperty({ description: 'Monthly revenue data', type: [MonthlyRevenueDto] })
  monthlyRevenue: MonthlyRevenueDto[];

  @ApiProperty({ description: 'Project values by status', type: [ProjectValueDto] })
  projectValues: ProjectValueDto[];

  @ApiProperty({ description: 'Expense breakdown', type: ExpensesDto })
  expenses: ExpensesDto;
}

// Main Dashboard DTO
export class DashboardDto {
  @ApiProperty({ description: 'Overview statistics', type: OverviewDto })
  overview: OverviewDto;

  @ApiProperty({ description: 'Project information', type: [ProjectDto] })
  projects: ProjectDto[];

  @ApiProperty({ description: 'Location information', type: [LocationDto] })
  locations: LocationDto[];

  @ApiProperty({ description: 'Service order information', type: [ServiceOrderDto] })
  serviceOrders: ServiceOrderDto[];

  @ApiProperty({ description: 'Subcontractor information', type: [SubcontractorDto] })
  subcontractors: SubcontractorDto[];

  @ApiProperty({ description: 'Risk information', type: [RiskDto] })
  risks: RiskDto[];

  @ApiProperty({ description: 'Recent activity information', type: [ActivityDto] })
  activities: ActivityDto[];

  @ApiProperty({ description: 'Financial information', type: FinancialsDto })
  financials: FinancialsDto;
}
