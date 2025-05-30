import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectStatus } from '../projects/project.schema';
import { Location, LocationStatus } from '../locations/location.schema';
import { ServiceOrder } from '../service-order/service-order.schema';
import {
  Subcontractor,
  SubcontractorSpecialty,
} from '../projects/project.schema';
import {
  DashboardDto,
  OverviewDto,
  ProjectDto,
  LocationDto,
  ServiceOrderDto,
  SubcontractorDto,
  RiskDto,
  ActivityDto,
  FinancialsDto,
  MonthlyRevenueDto,
  ProjectValueDto,
  ExpensesDto,
} from './dashboard.dto';
import { User } from '../auth/schemas/user.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Location.name) private locationModel: Model<Location>,
    @InjectModel(ServiceOrder.name)
    private serviceOrderModel: Model<ServiceOrder>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Subcontractor.name)
    private subcontractorModel: Model<Subcontractor>,
  ) {}

  async getDashboardData(): Promise<DashboardDto> {
    const [
      overview,
      projects,
      locations,
      serviceOrders,
      subcontractors,
      risks,
      activities,
      financials,
    ] = await Promise.all([
      this.getOverviewData(),
      this.getProjectsData(),
      this.getLocationsData(),
      this.getServiceOrdersData(),
      this.getSubcontractorsData(),
      this.getRisksData(),
      this.getActivitiesData(),
      this.getFinancialsData(),
    ]);

    return {
      overview,
      projects,
      locations,
      serviceOrders,
      subcontractors,
      risks,
      activities,
      financials,
    };
  }

  /**
   * Gets overview statistics for the dashboard
   * @returns Overview statistics
   */
  private async getOverviewData(): Promise<OverviewDto> {
    // Get project counts by status
    const projectCounts = await this.projectModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$contractValue' },
        },
      },
    ]);

    // Calculate various metrics
    const totalProjects = projectCounts.reduce(
      (sum, item) => sum + item.count,
      0,
    );
    const activeProjects =
      projectCounts.find((item) => item._id === ProjectStatus.IN_PROGRESS)
        ?.count || 0;
    const completedProjects =
      projectCounts.find((item) => item._id === ProjectStatus.COMPLETED)
        ?.count || 0;
    const onHoldProjects =
      projectCounts.find((item) => item._id === ProjectStatus.ON_HOLD)?.count ||
      0;
    const totalContractValue = projectCounts.reduce(
      (sum, item) => sum + (item.totalValue || 0),
      0,
    );

    // Get location count
    const totalLocations = await this.locationModel.countDocuments();

    // Get active subcontractors count
    const activeSubcontractors = await this.subcontractorModel.countDocuments({
      isActive: true,
    });

    // Get pending service orders count
    const pendingServiceOrders = await this.serviceOrderModel.countDocuments({
      status: 'pending',
    });

    // Calculate completion rate (completed projects / total projects)
    const completionRate =
      totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

    // Calculate average project duration
    const completedProjectsDuration = await this.projectModel.aggregate([
      {
        $match: {
          status: ProjectStatus.COMPLETED,
          actualStartDate: { $exists: true },
          actualCompletionDate: { $exists: true },
        },
      },
      {
        $project: {
          duration: {
            $divide: [
              { $subtract: ['$actualCompletionDate', '$actualStartDate'] },
              1000 * 60 * 60 * 24, // Convert ms to days
            ],
          },
        },
      },
      { $group: { _id: null, avgDuration: { $avg: '$duration' } } },
    ]);

    const avgProjectDuration =
      completedProjectsDuration.length > 0
        ? Math.round(completedProjectsDuration[0].avgDuration)
        : 45; // Default to 45 if no data

    // For demo purposes, hardcode some metrics that would typically come from other systems
    const monthlyRevenue = 8500000;
    const clientSatisfaction = 4.8;
    const profitMargin = 18.5;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      totalContractValue,
      monthlyRevenue,
      totalLocations,
      activeSubcontractors,
      pendingServiceOrders,
      completionRate,
      avgProjectDuration,
      clientSatisfaction,
      profitMargin,
    };
  }

  /**
   * Gets projects data for the dashboard
   * @returns Array of project data
   */
  private async getProjectsData(): Promise<ProjectDto[]> {
    const projects = await this.projectModel
      .find()
      .populate('location', 'name')
      .populate('projectLeader', 'firstName lastName')
      .populate('serviceOrder', 'issuedBy')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    return projects.map((project) => {
      // Calculate milestones and completed milestones
      const milestones = project.milestones?.length || 0;
      const completedMilestones =
        project.milestones?.filter((milestone) => milestone.progress === 100)
          .length || 0;

      // Calculate team size (subcontractors + leader)
      const team =
        (project.subcontractors?.length || 0) + (project.projectLeader ? 1 : 0);

      // Cast the populated fields to their respective types for proper property access
      const locationObj = project.location as any;
      const leaderObj = project.projectLeader as any;
      const serviceOrderObj = project.serviceOrder as any;

      return {
        id: project._id.toString(),
        name: project.name,
        status: project.status,
        progress: project.progress,
        contractValue: project.contractValue || 0,
        targetCompletion:
          project.targetCompletionDate?.toISOString().split('T')[0] || null,
        actualStart:
          project.actualStartDate?.toISOString().split('T')[0] || null,
        location: locationObj?.name || 'Unknown',
        priority: project.priority || 'Medium',
        projectLeader: leaderObj
          ? `${leaderObj.firstName} ${leaderObj.lastName}`
          : 'Unassigned',
        client: serviceOrderObj?.issuedBy || 'Unknown',
        capacity: project.capacity || 'N/A',
        type: project.projectType || 'N/A',
        milestones,
        completedMilestones,
        risks: project.risks?.length || 0,
        team,
      };
    });
  }

  /**
   * Gets locations data for the dashboard
   * @returns Array of location data
   */
  private async getLocationsData(): Promise<LocationDto[]> {
    const locations = await this.locationModel
      .find()
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    // Get project counts per location
    const projectCountsByLocation = await this.projectModel.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
    ]);

    const projectCountMap = new Map();
    projectCountsByLocation.forEach((item) => {
      projectCountMap.set(item._id.toString(), item.count);
    });

    return locations.map((location) => {
      return {
        id: location._id.toString(),
        name: location.name,
        county: location.county,
        // For demo purposes, derive region from county
        region: this.getRegionFromCounty(location.county),
        status: location.status || LocationStatus.ACTIVE,
        siteType: location.siteType,
        projectsCount: projectCountMap.get(location._id.toString()) || 0,
        coordinates: location.coordinates || { lat: 0, lng: 0 },
        // For demo purposes, use random values for these fields
        capacity: `${Math.floor(Math.random() * 100) + 20} kW`,
        utilization: Math.floor(Math.random() * 30) + 65, // 65-95% utilization
      };
    });
  }

  /**
   * Gets service orders data for the dashboard
   * @returns Array of service order data
   */
  private async getServiceOrdersData(): Promise<ServiceOrderDto[]> {
    const serviceOrders = await this.serviceOrderModel
      .find()
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    return serviceOrders.map((order) => {
      return {
        id: order._id.toString(),
        issuedBy: order.issuedBy,
        issuedTo: order.issuedTo,
        status: order.status || 'draft',
        serviceOrderDate:
          order.serviceOrderDate?.toISOString().split('T')[0] || '',
        region: order.locationInfo?.region || 'UNKNOWN',
        totalValue: order.totalValue || 0,
        // For demo purposes, use random priority
        priority: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        // For demo purposes, calculate a due date 30-60 days after service order date
        dueDate: order.serviceOrderDate
          ? new Date(
              order.serviceOrderDate.getTime() +
                (Math.floor(Math.random() * 30) + 30) * 24 * 60 * 60 * 1000,
            )
              .toISOString()
              .split('T')[0]
          : '',
      };
    });
  }

  /**
   * Gets subcontractors data for the dashboard
   * @returns Array of subcontractor data
   */
  private async getSubcontractorsData(): Promise<SubcontractorDto[]> {
    const subcontractors = await this.subcontractorModel
      .find({ isActive: true })
      .sort({ rating: -1 })
      .limit(10)
      .lean();

    return subcontractors.map((sub) => {
      const name = sub.isCompany
        ? sub.companyName
        : `${sub.firstName} ${sub.lastName}`;

      return {
        id: sub._id.toString(),
        name: name || 'Unknown',
        type: sub.isCompany ? 'company' : 'individual',
        specialty: sub.specialty || 'General',
        status: sub.isActive ? 'active' : 'inactive',
        rating: sub.rating || 0,
        // For demo purposes, use random values for these fields
        projectsAssigned: Math.floor(Math.random() * 5) + 1,
        completionRate: Math.floor(Math.random() * 15) + 85, // 85-100% completion rate
        location: sub.address ? this.extractLocation(sub.address) : 'Unknown',
      };
    });
  }

  /**
   * Gets risks data for the dashboard
   * @returns Array of risk data
   */
  private async getRisksData(): Promise<RiskDto[]> {
    // For this demo, we'll use the risks from projects
    const projectsWithRisks = await this.projectModel
      .find({ 'risks.0': { $exists: true } })
      .populate('projectLeader', 'firstName lastName')
      .select('name risks')
      .limit(10)
      .lean();

    const allRisks: RiskDto[] = [];

    projectsWithRisks.forEach((project) => {
      if (project.risks && project.risks.length > 0) {
        project.risks.forEach((risk, index) => {
          allRisks.push({
            id: index.toString(),
            title: risk.title,
            description: risk.description || '',
            severity: risk.severity,
            probability: risk.probability || 0.5,
            impact: risk.impact || 5,
            status: risk.status,
            owner: risk.owner
              ? (typeof project.projectLeader === 'object' && project.projectLeader && 'firstName' in project.projectLeader && 'lastName' in project.projectLeader
                ? `${project.projectLeader.firstName} ${project.projectLeader.lastName}`
                : 'Unassigned')
              : 'Unassigned',
            project: project.name,
            identifiedDate:
              risk.identifiedDate?.toISOString().split('T')[0] || '',
            targetResolution:
              risk.targetResolutionDate?.toISOString().split('T')[0] || '',
          });
        });
      }
    });

    return allRisks.slice(0, 10); // Limit to 10 risks
  }

  /**
   * Gets recent activities data for the dashboard
   * @returns Array of activity data
   */
  private async getActivitiesData(): Promise<ActivityDto[]> {
    // For the demo, we'll return hardcoded activities
    // In a real implementation, this would come from a system_logs or activities collection
    return [
      {
        id: '1',
        type: 'project_update',
        title: 'Kitengela Solar Installation - Milestone Completed',
        description:
          'Site preparation and foundation work completed ahead of schedule',
        timestamp: '2025-05-29T14:30:00Z',
        user: 'Charles Mihunyo',
        priority: 'normal',
      },
      {
        id: '2',
        type: 'risk_identified',
        title: 'New Risk Identified - Equipment Delivery',
        description: 'Potential delay in solar panel delivery identified',
        timestamp: '2025-05-29T10:15:00Z',
        user: 'System',
        priority: 'high',
      },
      {
        id: '3',
        type: 'service_order',
        title: 'New Service Order - AIRTEL KENYA',
        description: 'Service order SO-2025-001 approved and assigned',
        timestamp: '2025-05-29T09:00:00Z',
        user: 'Jane Wanjiku',
        priority: 'normal',
      },
    ];
  }

  /**
   * Gets financial data for the dashboard
   * @returns Financial data
   */
  private async getFinancialsData(): Promise<FinancialsDto> {
    // For the demo, we'll return hardcoded financial data
    // In a real implementation, this would be calculated from financial records

    // Monthly revenue data
    const monthlyRevenue: MonthlyRevenueDto[] = [
      { month: 'Jan', revenue: 6500000, target: 7000000 },
      { month: 'Feb', revenue: 7200000, target: 7000000 },
      { month: 'Mar', revenue: 8100000, target: 7500000 },
      { month: 'Apr', revenue: 7800000, target: 8000000 },
      { month: 'May', revenue: 8500000, target: 8000000 },
    ];

    // Project values by status
    const projectValues: ProjectValueDto[] = [
      { status: 'Completed', value: 16800000 },
      { status: 'In Progress', value: 42000000 },
      { status: 'Planning', value: 28500000 },
      { status: 'On Hold', value: 8200000 },
    ];

    // Expense breakdown
    const expenses: ExpensesDto = {
      materials: 35000000,
      labor: 18000000,
      equipment: 12000000,
      overhead: 8500000,
    };

    return {
      monthlyRevenue,
      projectValues,
      expenses,
    };
  }

  /**
   * Helper method to derive region from county
   * @param county County name
   * @returns Region name
   */
  private getRegionFromCounty(county: string): string {
    // Simple mapping of counties to regions
    const countyToRegion = {
      Nairobi: 'Central',
      Mombasa: 'Coast',
      Kisumu: 'Nyanza',
      Nakuru: 'Rift Valley',
      'Uasin Gishu': 'Rift Valley',
      Machakos: 'Eastern',
      Garissa: 'North Eastern',
      Kakamega: 'Western',
    };

    return countyToRegion[county] || 'Other';
  }

  /**
   * Helper method to extract location from address
   * @param address Full address
   * @returns Location name
   */
  private extractLocation(address: string): string {
    // Simple extraction of the first part of the address as the location
    const parts = address.split(',');
    if (parts.length > 0) {
      return parts[parts.length - 1].trim();
    }
    return 'Unknown';
  }
}
