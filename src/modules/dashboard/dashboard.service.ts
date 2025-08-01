import { Injectable, Logger } from '@nestjs/common';
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
import { DashboardStatsDto } from '../inventory/inventory.dto';
import {
  InventoryItem,
  InventoryTransaction,
} from '../inventory/inventory.schema';

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
    @InjectModel(InventoryItem.name)
    private inventoryModel: Model<InventoryItem>,
    @InjectModel(InventoryTransaction.name)
    private transactionModel: Model<InventoryTransaction>,
  ) {}
  private readonly logger = new Logger(DashboardService.name);

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
      // const serviceOrderObj = project.serviceOrder as any;

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
        // client: serviceOrderObj?.issuedBy || 'Unknown',
        client: 'Unknown',

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
              ? typeof project.projectLeader === 'object' &&
                project.projectLeader &&
                'firstName' in project.projectLeader &&
                'lastName' in project.projectLeader
                ? `${project.projectLeader.firstName} ${project.projectLeader.lastName}`
                : 'Unassigned'
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

  async getDashboardStats() {
    try {
      // Get current date and calculate date ranges for various metrics
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfPrevMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      );
      const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      const ninetyDaysAgo = new Date(now);
      ninetyDaysAgo.setDate(now.getDate() - 90);

      const [
        totalItemsResult,
        valuationResult,
        stockStatusCounts,
        monthlyTransactionsData,
        transactionValueByType,
        topSellingItems,
        recentTransactions,
        inventoryTurnoverData,
        stockDistributionByCategory,
        stockDistributionByLocation,
      ] = await Promise.all([
        // Total active items count
        this.inventoryModel.countDocuments({ isActive: true }),

        // Total inventory value with average cost per item
        this.inventoryModel.aggregate([
          { $match: { isActive: true } },
          {
            $project: {
              itemCode: 1,
              itemName: 1,
              category: 1,
              totalStock: { $sum: '$stockLevels.currentStock' },
              standardCost: { $ifNull: ['$pricing.standardCost', 0] },
              totalValue: {
                $multiply: [
                  { $sum: '$stockLevels.currentStock' },
                  { $ifNull: ['$pricing.standardCost', 0] },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              totalValue: { $sum: '$totalValue' },
              avgItemValue: { $avg: '$standardCost' },
              itemCount: { $sum: 1 },
              highValueItems: {
                $push: {
                  $cond: [
                    { $gt: ['$totalValue', 100000] }, // Items worth more than 100,000
                    {
                      itemId: '$_id',
                      itemCode: '$itemCode',
                      itemName: '$itemName',
                      category: '$category',
                      totalValue: '$totalValue',
                      quantity: '$totalStock',
                    },
                    null,
                  ],
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              totalValue: 1,
              avgItemValue: 1,
              itemCount: 1,
              highValueItems: {
                $filter: {
                  input: '$highValueItems',
                  as: 'item',
                  cond: { $ne: ['$$item', null] },
                },
              },
            },
          },
        ]),

        // Comprehensive stock status counts
        this.inventoryModel.aggregate([
          { $match: { isActive: true } },
          {
            $facet: {
              // Low stock items
              lowStock: [
                {
                  $addFields: {
                    isLowStock: {
                      $anyElementTrue: {
                        $map: {
                          input: '$stockLevels',
                          as: 'level',
                          in: {
                            $and: [
                              { $gt: ['$$level.currentStock', 0] },
                              {
                                $lte: [
                                  '$$level.currentStock',
                                  '$$level.minimumLevel',
                                ],
                              },
                            ],
                          },
                        },
                      },
                    },
                  },
                },
                { $match: { isLowStock: true } },
                { $count: 'count' },
              ],
              // Out of stock items
              outOfStock: [
                {
                  $addFields: {
                    isOutOfStock: {
                      $anyElementTrue: {
                        $map: {
                          input: '$stockLevels',
                          as: 'level',
                          in: { $eq: ['$$level.currentStock', 0] },
                        },
                      },
                    },
                  },
                },
                { $match: { isOutOfStock: true } },
                { $count: 'count' },
              ],
              // Overstocked items
              overStocked: [
                {
                  $addFields: {
                    isOverStocked: {
                      $anyElementTrue: {
                        $map: {
                          input: '$stockLevels',
                          as: 'level',
                          in: {
                            $and: [
                              { $gt: ['$$level.maximumLevel', 0] },
                              {
                                $gt: [
                                  '$$level.currentStock',
                                  '$$level.maximumLevel',
                                ],
                              },
                            ],
                          },
                        },
                      },
                    },
                  },
                },
                { $match: { isOverStocked: true } },
                { $count: 'count' },
              ],
              // Healthy stock items
              healthyStock: [
                {
                  $addFields: {
                    isHealthyStock: {
                      $anyElementTrue: {
                        $map: {
                          input: '$stockLevels',
                          as: 'level',
                          in: {
                            $and: [
                              {
                                $gt: [
                                  '$$level.currentStock',
                                  '$$level.minimumLevel',
                                ],
                              },
                              {
                                $or: [
                                  { $eq: ['$$level.maximumLevel', null] },
                                  { $eq: ['$$level.maximumLevel', 0] },
                                  {
                                    $lte: [
                                      '$$level.currentStock',
                                      '$$level.maximumLevel',
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        },
                      },
                    },
                  },
                },
                { $match: { isHealthyStock: true } },
                { $count: 'count' },
              ],
              // Items with reserved stock
              reservedStock: [
                {
                  $match: {
                    'stockLevels.reservedStock': { $gt: 0 },
                  },
                },
                { $count: 'count' },
              ],
            },
          },
          {
            $project: {
              lowStockCount: { $arrayElemAt: ['$lowStock.count', 0] },
              outOfStockCount: { $arrayElemAt: ['$outOfStock.count', 0] },
              overStockedCount: { $arrayElemAt: ['$overStocked.count', 0] },
              healthyStockCount: { $arrayElemAt: ['$healthyStock.count', 0] },
              reservedStockCount: { $arrayElemAt: ['$reservedStock.count', 0] },
            },
          },
        ]),

        // Monthly transactions with daily breakdown and trends
        this.transactionModel.aggregate([
          {
            $match: {
              transactionDate: { $gte: startOfPrevMonth },
            },
          },
          {
            $facet: {
              // Daily transaction counts for current month
              dailyTransactions: [
                {
                  $match: {
                    transactionDate: { $gte: startOfMonth },
                  },
                },
                {
                  $group: {
                    _id: {
                      $dateToString: {
                        format: '%Y-%m-%d',
                        date: '$transactionDate',
                      },
                    },
                    count: { $sum: 1 },
                    totalQuantity: { $sum: '$quantity' },
                    totalValue: { $sum: { $ifNull: ['$totalValue', 0] } },
                  },
                },
                { $sort: { _id: 1 } },
              ],
              // Current month totals
              currentMonthSummary: [
                {
                  $match: {
                    transactionDate: { $gte: startOfMonth },
                  },
                },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                    totalQuantity: { $sum: '$quantity' },
                    totalValue: { $sum: { $ifNull: ['$totalValue', 0] } },
                  },
                },
              ],
              // Previous month totals for comparison
              previousMonthSummary: [
                {
                  $match: {
                    transactionDate: {
                      $gte: startOfPrevMonth,
                      $lt: startOfMonth,
                    },
                  },
                },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                    totalQuantity: { $sum: '$quantity' },
                    totalValue: { $sum: { $ifNull: ['$totalValue', 0] } },
                  },
                },
              ],
            },
          },
          {
            $project: {
              dailyTransactions: 1,
              currentMonth: { $arrayElemAt: ['$currentMonthSummary', 0] },
              previousMonth: { $arrayElemAt: ['$previousMonthSummary', 0] },
            },
          },
        ]),

        // Transaction value by type (for financial insights)
        this.transactionModel.aggregate([
          {
            $match: {
              transactionDate: { $gte: thirtyDaysAgo },
              totalValue: { $exists: true, $ne: null },
            },
          },
          {
            $group: {
              _id: '$transactionType',
              count: { $sum: 1 },
              totalValue: { $sum: '$totalValue' },
              avgValue: { $avg: '$totalValue' },
            },
          },
          {
            $project: {
              transactionType: '$_id',
              _id: 0,
              count: 1,
              totalValue: 1,
              avgValue: 1,
            },
          },
          { $sort: { totalValue: -1 } },
        ]),

        // Top selling items with more details
        this.transactionModel.aggregate([
          {
            $match: {
              transactionType: { $in: ['SALE', 'TRANSFER_OUT', 'CONSUMPTION'] },
              transactionDate: { $gte: thirtyDaysAgo },
            },
          },
          {
            $group: {
              _id: '$inventoryItem',
              totalQuantity: { $sum: '$quantity' },
              totalValue: { $sum: { $ifNull: ['$totalValue', 0] } },
              transactionCount: { $sum: 1 },
              lastTransactionDate: { $max: '$transactionDate' },
            },
          },
          { $sort: { totalQuantity: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'inventoryitems',
              localField: '_id',
              foreignField: '_id',
              as: 'itemDetails',
            },
          },
          {
            $project: {
              _id: 1,
              totalQuantity: 1,
              totalValue: 1,
              transactionCount: 1,
              lastTransactionDate: 1,
              itemName: { $arrayElemAt: ['$itemDetails.itemName', 0] },
              itemCode: { $arrayElemAt: ['$itemDetails.itemCode', 0] },
              category: { $arrayElemAt: ['$itemDetails.category', 0] },
              currentStock: {
                $sum: {
                  $arrayElemAt: ['$itemDetails.stockLevels.currentStock', 0],
                },
              },
            },
          },
        ]),

        // Recent transactions with more context
        this.transactionModel
          .find()
          .sort({ transactionDate: -1 })
          .limit(5)
          .populate('inventoryItem', 'itemName itemCode category')
          .populate('fromLocation', 'name')
          .populate('toLocation', 'name')
          .populate('performedBy', 'name')
          .lean(),

        // Inventory turnover data (for operational efficiency)
        this.transactionModel.aggregate([
          {
            $match: {
              transactionDate: { $gte: ninetyDaysAgo },
              transactionType: { $in: ['SALE', 'CONSUMPTION', 'TRANSFER_OUT'] },
            },
          },
          {
            $group: {
              _id: '$inventoryItem',
              totalQuantitySold: { $sum: '$quantity' },
            },
          },
          {
            $lookup: {
              from: 'inventoryitems',
              localField: '_id',
              foreignField: '_id',
              as: 'itemDetails',
            },
          },
          {
            $project: {
              _id: 1,
              totalQuantitySold: 1,
              itemName: { $arrayElemAt: ['$itemDetails.itemName', 0] },
              itemCode: { $arrayElemAt: ['$itemDetails.itemCode', 0] },
              category: { $arrayElemAt: ['$itemDetails.category', 0] },
              currentStock: {
                $sum: {
                  $arrayElemAt: ['$itemDetails.stockLevels.currentStock', 0],
                },
              },
              turnoverRatio: {
                $cond: [
                  {
                    $gt: [
                      {
                        $sum: {
                          $arrayElemAt: [
                            '$itemDetails.stockLevels.currentStock',
                            0,
                          ],
                        },
                      },
                      0,
                    ],
                  },
                  {
                    $divide: [
                      '$totalQuantitySold',
                      {
                        $sum: {
                          $arrayElemAt: [
                            '$itemDetails.stockLevels.currentStock',
                            0,
                          ],
                        },
                      },
                    ],
                  },
                  0,
                ],
              },
            },
          },
          { $match: { turnoverRatio: { $gt: 0 } } },
          { $sort: { turnoverRatio: -1 } },
          { $limit: 10 },
        ]),

        // Stock distribution by category
        this.inventoryModel.aggregate([
          { $match: { isActive: true } },
          {
            $group: {
              _id: '$category',
              itemCount: { $sum: 1 },
              totalStock: { $sum: { $sum: '$stockLevels.currentStock' } },
              totalValue: {
                $sum: {
                  $multiply: [
                    { $sum: '$stockLevels.currentStock' },
                    { $ifNull: ['$pricing.standardCost', 0] },
                  ],
                },
              },
            },
          },
          {
            $project: {
              category: '$_id',
              _id: 0,
              itemCount: 1,
              totalStock: 1,
              totalValue: 1,
              percentageOfTotal: { $multiply: ['$itemCount', 100] }, // Will be normalized later
            },
          },
          { $sort: { totalValue: -1 } },
        ]),

        // Stock distribution by location
        this.inventoryModel.aggregate([
          { $match: { isActive: true } },
          { $unwind: '$stockLevels' },
          {
            $group: {
              _id: '$stockLevels.location',
              totalStock: { $sum: '$stockLevels.currentStock' },
              itemCount: { $sum: 1 },
              lowStockCount: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $gt: ['$stockLevels.currentStock', 0] },
                        {
                          $lte: [
                            '$stockLevels.currentStock',
                            '$stockLevels.minimumLevel',
                          ],
                        },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              outOfStockCount: {
                $sum: {
                  $cond: [{ $eq: ['$stockLevels.currentStock', 0] }, 1, 0],
                },
              },
            },
          },
          {
            $lookup: {
              from: 'stocklocations',
              localField: '_id',
              foreignField: '_id',
              as: 'locationDetails',
            },
          },
          {
            $project: {
              _id: 0,
              locationId: '$_id',
              locationName: { $arrayElemAt: ['$locationDetails.name', 0] },
              totalStock: 1,
              itemCount: 1,
              lowStockCount: 1,
              outOfStockCount: 1,
            },
          },
          { $sort: { totalStock: -1 } },
        ]),
      ]);

      // Process results
      const totalInventoryValue =
        valuationResult.length > 0 ? valuationResult[0].totalValue : 0;
      const avgItemValue =
        valuationResult.length > 0 ? valuationResult[0].avgItemValue : 0;
      const highValueItems =
        valuationResult.length > 0
          ? valuationResult[0].highValueItems.slice(0, 5)
          : [];

      // Process stock status counts
      const lowStockCount = stockStatusCounts[0]?.lowStockCount || 0;
      const outOfStockCount = stockStatusCounts[0]?.outOfStockCount || 0;
      const overStockedCount = stockStatusCounts[0]?.overStockedCount || 0;
      const healthyStockCount = stockStatusCounts[0]?.healthyStockCount || 0;
      const reservedStockCount = stockStatusCounts[0]?.reservedStockCount || 0;

      // Process monthly transactions data
      const currentMonthTransactions = monthlyTransactionsData[0]?.count || 0;
      const previousMonthTransactions = monthlyTransactionsData[0]?.count || 0;
      const transactionGrowth = previousMonthTransactions
        ? ((currentMonthTransactions - previousMonthTransactions) /
            previousMonthTransactions) *
          100
        : 0;

      // Process transaction values by type
      const transactionSummary = transactionValueByType.reduce(
        (acc, curr) => {
          acc.totalTransactionValue += curr.totalValue;
          return acc;
        },
        { totalTransactionValue: 0 },
      );

      // Process top categories from transactions
      const topCategories = await this.transactionModel.aggregate([
        {
          $match: {
            transactionDate: { $gte: thirtyDaysAgo },
          },
        },
        {
          $lookup: {
            from: 'inventoryitems',
            let: { itemId: '$inventoryItem' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$itemId'] } } },
              { $project: { category: 1 } },
            ],
            as: 'itemDetails',
          },
        },
        {
          $group: {
            _id: { $arrayElemAt: ['$itemDetails.category', 0] },
            transactionCount: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
            totalValue: { $sum: { $ifNull: ['$totalValue', 0] } },
          },
        },
        { $match: { _id: { $ne: null } } },
        { $sort: { transactionCount: -1 } },
        { $limit: 5 },
        {
          $project: {
            _id: 0,
            category: '$_id',
            transactionCount: 1,
            totalQuantity: 1,
            totalValue: 1,
          },
        },
      ] as any[]);

      // Get recent stock alerts with more context
      const recentAlerts = await this.inventoryModel.aggregate([
        { $match: { isActive: true } },
        { $unwind: '$stockLevels' },
        {
          $project: {
            itemId: '$_id',
            itemName: '$itemName',
            itemCode: '$itemCode',
            category: '$category',
            currentStock: '$stockLevels.currentStock',
            minimumLevel: '$stockLevels.minimumLevel',
            maximumLevel: '$stockLevels.maximumLevel',
            locationId: '$stockLevels.location',
            standardCost: { $ifNull: ['$pricing.standardCost', 0] },
            daysToStockout: {
              $cond: [
                { $gt: ['$stockLevels.currentStock', 0] },
                {
                  $divide: [
                    '$stockLevels.currentStock',
                    {
                      $max: [{ $ifNull: ['$stockLevels.avgDailyUsage', 1] }, 1],
                    },
                  ],
                },
                0,
              ],
            },
          },
        },
        {
          $lookup: {
            from: 'stocklocations',
            let: { locId: '$locationId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$locId'] } } },
              { $project: { name: 1 } },
            ],
            as: 'locationDetails',
          },
        },
        {
          $project: {
            itemId: 1,
            itemName: 1,
            itemCode: 1,
            category: 1,
            currentStock: 1,
            minimumLevel: 1,
            maximumLevel: 1,
            standardCost: 1,
            daysToStockout: 1,
            location: { $arrayElemAt: ['$locationDetails.name', 0] },
            alertType: {
              $cond: [
                { $eq: ['$currentStock', 0] },
                'out_of_stock',
                {
                  $cond: [
                    { $lte: ['$currentStock', '$minimumLevel'] },
                    'low_stock',
                    {
                      $cond: [
                        { $gte: ['$currentStock', '$maximumLevel'] },
                        'overstock',
                        'normal',
                      ],
                    },
                  ],
                },
              ],
            },
            alertSeverity: {
              $cond: [
                { $eq: ['$currentStock', 0] },
                'critical',
                {
                  $cond: [
                    { $lte: ['$daysToStockout', 7] },
                    'high',
                    {
                      $cond: [
                        { $lte: ['$daysToStockout', 14] },
                        'medium',
                        'low',
                      ],
                    },
                  ],
                },
              ],
            },
            estimatedValue: { $multiply: ['$currentStock', '$standardCost'] },
          },
        },
        { $match: { alertType: { $ne: 'normal' } } },
        { $sort: { alertSeverity: 1, currentStock: 1 } },
        { $limit: 10 },
      ] as any[]);

      // Calculate inventory health score (0-100)
      const totalItems = totalItemsResult || 0;
      const inventoryHealthScore = totalItems
        ? Math.round(((healthyStockCount || 0) / totalItems) * 100)
        : 0;

      // Normalize category percentages
      if (stockDistributionByCategory.length > 0) {
        const totalItems = stockDistributionByCategory.reduce(
          (sum, cat) => sum + cat.itemCount,
          0,
        );
        stockDistributionByCategory.forEach((cat) => {
          cat.percentageOfTotal = Math.round(
            (cat.itemCount / totalItems) * 100,
          );
        });
      }

      // Prepare inventory insights
      const inventoryInsights = [];

      // Add critical insights based on data
      if (lowStockCount > 0) {
        inventoryInsights.push({
          type: 'warning',
          message: `${lowStockCount} items are below minimum stock levels and need replenishment.`,
        });
      }

      if (outOfStockCount > 0) {
        inventoryInsights.push({
          type: 'critical',
          message: `${outOfStockCount} items are completely out of stock and require immediate attention.`,
        });
      }

      if (overStockedCount > 0) {
        inventoryInsights.push({
          type: 'info',
          message: `${overStockedCount} items are overstocked, consider optimizing inventory levels.`,
        });
      }

      if (transactionGrowth > 20) {
        inventoryInsights.push({
          type: 'positive',
          message: `Transaction volume increased by ${Math.round(transactionGrowth)}% compared to last month.`,
        });
      } else if (transactionGrowth < -10) {
        inventoryInsights.push({
          type: 'warning',
          message: `Transaction volume decreased by ${Math.round(Math.abs(transactionGrowth))}% compared to last month.`,
        });
      }

      if (highValueItems.length > 0) {
        inventoryInsights.push({
          type: 'info',
          message: `${highValueItems.length} high-value items account for ${Math.round((highValueItems.reduce((sum, item) => sum + item.totalValue, 0) / totalInventoryValue) * 100)}% of total inventory value.`,
        });
      }

      // Prepare the enhanced dashboard stats
      const dashboardStats = {
        // Basic metrics
        totalItems: totalItemsResult,
        totalValue: totalInventoryValue,
        lowStockItems: lowStockCount,
        outOfStockItems: outOfStockCount,
        monthlyTransactions: currentMonthTransactions,

        // Enhanced metrics
        inventoryHealth: {
          healthyStockItems: healthyStockCount,
          lowStockItems: lowStockCount,
          outOfStockItems: outOfStockCount,
          overStockedItems: overStockedCount,
          reservedStockItems: reservedStockCount,
          inventoryHealthScore: inventoryHealthScore,
        },

        financialMetrics: {
          totalInventoryValue: totalInventoryValue,
          averageItemValue: avgItemValue,
          highValueItems: highValueItems,
          transactionValueByType: transactionValueByType,
          totalTransactionValue: transactionSummary.totalTransactionValue,
        },

        transactionMetrics: {
          currentMonthTransactions: currentMonthTransactions,
          previousMonthTransactions: previousMonthTransactions,
          transactionGrowth: transactionGrowth,
          dailyTransactions:
            monthlyTransactionsData[0]?.dailyTransactions || [],
        },

        inventoryDistribution: {
          byCategory: stockDistributionByCategory,
          byLocation: stockDistributionByLocation,
        },

        operationalInsights: {
          // topSellingItems: topSellingItems,
          // topTurnoverItems: inventoryTurnoverData,
          inventoryInsights: inventoryInsights,
        },

        // Original metrics
        topCategories: topCategories,
        recentAlerts: recentAlerts,
        recentTransactions: recentTransactions,
      };

      return {
        success: true,
        message: 'Dashboard statistics retrieved successfully',
        data: dashboardStats,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Error getting dashboard stats: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
