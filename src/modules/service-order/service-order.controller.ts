import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { ServiceOrderService } from './service-order.service';
import { ServiceOrder } from './service-order.schema';
import { CreateBillOfMaterialsItemDto, CreateServiceOrderDto, UpdateServiceOrderDto } from './service-order.dto';

@ApiTags('Service Orders')
@ApiBearerAuth()
@Controller('service-orders')
export class ServiceOrderController {
  constructor(private readonly serviceOrderService: ServiceOrderService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new service order' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Service order created successfully',
    type: ServiceOrder,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async create(@Body() createServiceOrderDto: CreateServiceOrderDto) {
    return this.serviceOrderService.create(createServiceOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all service orders with filtering' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'issuedBy', required: false, description: 'Filter by issuer' })
  @ApiQuery({ name: 'issuedTo', required: false, description: 'Filter by recipient' })
  @ApiQuery({ name: 'region', required: false, description: 'Filter by region' })
  @ApiQuery({ name: 'siteId', required: false, description: 'Filter by site ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit results' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset for pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of service orders',
    type: [ServiceOrder],
  })
  async findAll(@Query() query: any) {
    return this.serviceOrderService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get service order statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service order statistics',
  })
  async getStatistics() {
    return this.serviceOrderService.getStatistics();
  }

  @Get('site/:siteId')
  @ApiOperation({ summary: 'Get service orders by site ID' })
  @ApiParam({ name: 'siteId', description: 'Site ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service orders for the site',
    type: [ServiceOrder],
  })
  async findBySiteId(@Param('siteId') siteId: string) {
    return this.serviceOrderService.findBySiteId(siteId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service order by ID' })
  @ApiParam({ name: 'id', description: 'Service order ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service order details',
    type: ServiceOrder,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service order not found',
  })
  async findOne(@Param('id') id: string) {
    return this.serviceOrderService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a service order' })
  @ApiParam({ name: 'id', description: 'Service order ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service order updated successfully',
    type: ServiceOrder,
  })
  async update(
    @Param('id') id: string,
    @Body() updateServiceOrderDto: UpdateServiceOrderDto,
  ) {
    return this.serviceOrderService.update(id, updateServiceOrderDto);
  }

  @Patch(':id/design-summary')
  @ApiOperation({ summary: 'Update design summary (dynamic fields)' })
  @ApiParam({ name: 'id', description: 'Service order ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Design summary updated successfully',
    type: ServiceOrder,
  })
  async updateDesignSummary(
    @Param('id') id: string,
    @Body() designSummary: Record<string, any>,
  ) {
    return this.serviceOrderService.updateDesignSummary(id, designSummary);
  }

  @Post(':id/bill-of-materials')
  @ApiOperation({ summary: 'Add item to bill of materials' })
  @ApiParam({ name: 'id', description: 'Service order ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Item added to bill of materials',
    type: ServiceOrder,
  })
  async addBillOfMaterialsItem(
    @Param('id') id: string,
    @Body() item: CreateBillOfMaterialsItemDto,
  ) {
    return this.serviceOrderService.addBillOfMaterialsItem(id, item);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a service order' })
  @ApiParam({ name: 'id', description: 'Service order ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service order approved successfully',
    type: ServiceOrder,
  })
  async approve(
    @Param('id') id: string,
    @Body() approvalData: { approvedBy: string; approvalComments?: string },
  ) {
    return this.serviceOrderService.approve(id, approvalData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a service order' })
  @ApiParam({ name: 'id', description: 'Service order ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Service order deleted successfully',
  })
  async remove(@Param('id') id: string) {
    return this.serviceOrderService.remove(id);
  }
}

