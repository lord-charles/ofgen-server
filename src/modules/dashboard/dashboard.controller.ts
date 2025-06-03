import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardDto } from './dashboard.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiResponseDto } from '../inventory/inventory.dto';
import { DashboardStatsDto } from '../inventory/inventory.dto';
import { HttpStatus } from '@nestjs/common';

@ApiTags('Dashboard')
@Controller('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({
    summary: 'Get dashboard data',
    description:
      'Retrieves comprehensive dashboard data including statistics, projects, locations, service orders, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
    type: DashboardDto,
  })
  // @Roles('admin', 'employee')
  async getDashboardData(): Promise<DashboardDto> {
    return this.dashboardService.getDashboardData();
  }

  @Get('inventory-stats')
  @ApiOperation({ summary: 'Get inventory dashboard statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dashboard statistics retrieved successfully',
    type: () => ApiResponseDto<DashboardStatsDto>,
  })
  getDashboardStats() {
    return this.dashboardService.getDashboardStats();
  }
}
