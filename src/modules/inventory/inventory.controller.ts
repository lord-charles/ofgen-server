import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import {
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  InventoryItemResponseDto,
  CreateTransactionDto,
  TransactionResponseDto,
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierResponseDto,
  CreateStockLocationDto,
  UpdateStockLocationDto,
  StockLocationResponseDto,
  InventoryQueryDto,
  TransactionQueryDto,
  PaginatedResponseDto,
  ApiResponseDto,
  BulkUpdateStockDto,
  StockAdjustmentDto,
  StockReportDto,
  StockMovementReportDto,
  DashboardStatsDto,
  ReservedStockUpdateDto,
  ReservedStockAction,
} from './inventory.dto';
import { TransactionType } from './inventory.schema';

@ApiTags('Inventory Management')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ========================= INVENTORY ITEM ENDPOINTS =========================

  @Post('warehouses')
  @ApiOperation({ summary: 'Create a new warehouse/stock location' })
  @ApiResponse({
    status: 201,
    description: 'Warehouse created',
    schema: {
      example: {
        success: true,
        message: 'Warehouse/stock location created successfully',
        data: {
          _id: '60f7a9c8c2b4a12e6c8b4567',
          name: 'Main Warehouse',
          address: '123 Main St',
          city: 'Nairobi',
          county: 'Nairobi',
          createdAt: '2025-06-02T15:00:00.000Z',
          updatedAt: '2025-06-02T15:00:00.000Z',
          __v: 0,
        },
        timestamp: '2025-06-02T15:00:00.000Z',
      },
    },
  })
  async createWarehouse(@Body() dto: CreateStockLocationDto) {
    return this.inventoryService.createStockLocation(dto);
  }

  @Get('warehouses/:id')
  @ApiOperation({ summary: 'Get a specific warehouse/stock location by ID' })
  @ApiParam({ name: 'id', description: 'Warehouse/stock location ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Warehouse/stock location retrieved successfully',
    type: () => ApiResponseDto<StockLocationResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Warehouse/stock location not found',
  })
  async getWarehouseById(@Param('id') id: string) {
    return this.inventoryService.getWarehouseById(id);
  }

  @Get('warehouses')
  @ApiOperation({ summary: 'Get all warehouses/stock locations' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Warehouses/stock locations retrieved successfully',
    type: () => PaginatedResponseDto<StockLocationResponseDto>,
  })
  async getAllWarehouses() {
    return this.inventoryService.getAllWarehouses();
  }

  @Patch('warehouses/:id')
  @ApiOperation({ summary: 'Update a warehouse/stock location by ID' })
  @ApiParam({ name: 'id', description: 'Warehouse/stock location ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Warehouse/stock location updated successfully',
    type: () => ApiResponseDto<StockLocationResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Warehouse/stock location not found',
  })
  async updateWarehousePartial(
    @Param('id') id: string,
    @Body() dto: UpdateStockLocationDto,
  ) {
    return this.inventoryService.updateWarehouseById(id, dto);
  }

  @Delete('warehouses/:id')
  @ApiOperation({ summary: 'Delete a warehouse/stock location by ID' })
  @ApiParam({ name: 'id', description: 'Warehouse/stock location ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Warehouse/stock location deleted successfully',
    type: () => ApiResponseDto<void>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Warehouse/stock location not found',
  })
  async deleteWarehouse(@Param('id') id: string) {
    return this.inventoryService.deleteWarehouseById(id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Create a new inventory item' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Inventory item created successfully',
    type: () => ApiResponseDto<InventoryItemResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Item code already exists',
  })
  createInventoryItem(@Body() createInventoryItemDto: CreateInventoryItemDto) {
    return this.inventoryService.createInventoryItem(createInventoryItemDto);
  }

  @Get('items')
  @ApiOperation({
    summary: 'Get all inventory items with filtering and pagination',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inventory items retrieved successfully',
    type: () => PaginatedResponseDto<InventoryItemResponseDto>,
  })
  findAllInventoryItems(@Query() query: InventoryQueryDto) {
    return this.inventoryService.findAllInventoryItems(query);
  }

  @Get('items/:id')
  @ApiOperation({ summary: 'Get a specific inventory item by ID' })
  @ApiParam({ name: 'id', description: 'Inventory item ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inventory item retrieved successfully',
    type: () => ApiResponseDto<InventoryItemResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Inventory item not found',
  })
  findInventoryItemById(@Param('id') id: string) {
    return this.inventoryService.findInventoryItemById(id);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update an inventory item' })
  @ApiParam({ name: 'id', description: 'Inventory item ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inventory item updated successfully',
    type: () => ApiResponseDto<InventoryItemResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Inventory item not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  updateInventoryItem(
    @Param('id') id: string,
    @Body() updateInventoryItemDto: UpdateInventoryItemDto,
  ) {
    return this.inventoryService.updateInventoryItem(
      id,
      updateInventoryItemDto,
    );
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Delete an inventory item or mark as inactive' })
  @ApiParam({ name: 'id', description: 'Inventory item ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inventory item deleted or deactivated successfully',
    type: () => ApiResponseDto<void>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Inventory item not found',
  })
  deleteInventoryItem(@Param('id') id: string): Promise<ApiResponseDto<void>> {
    return this.inventoryService.deleteInventoryItem(id);
  }

  // ========================= TRANSACTION ENDPOINTS =========================

  @Post('transactions')
  @ApiOperation({
    summary: 'Create a new inventory transaction',
    description:
      'Create various types of inventory transactions including purchases, sales, transfers, and more',
  })
  @ApiBody({
    type: CreateTransactionDto,
    examples: {
      purchase: {
        summary: 'Purchase from supplier',
        description:
          'Add stock to a warehouse location from a supplier purchase',
        value: {
          inventoryItem: '507f1f77bcf86cd799439011',
          transactionType: TransactionType.PURCHASE,
          quantity: 100,
          unitPrice: 1500,
          totalValue: 150000,
          toLocation: '507f1f77bcf86cd799439012',
          supplier: '507f1f77bcf86cd799439015',
          performedBy: '507f1f77bcf86cd799439016',
          notes: 'Regular stock replenishment',
          documentRef: 'INV-EAES-2024-5678',
        },
      },
      sale: {
        summary: 'Sale Transaction',
        description: 'Reduce stock due to a customer sale',
        value: {
          inventoryItem: '507f1f77bcf86cd799439011',
          transactionType: TransactionType.SALE,
          quantity: 25,
          unitPrice: 2000,
          totalValue: 50000,
          fromLocation: '507f1f77bcf86cd799439012',
          performedBy: '507f1f77bcf86cd799439016',
          notes: 'Sale to Kenya Power for Nairobi West substation',
          documentRef: 'SO-2024-1234',
        },
      },
      transfer: {
        summary: 'Transfer Transaction',
        description: 'Move stock between warehouses',
        value: {
          inventoryItem: '507f1f77bcf86cd799439011',
          transactionType: TransactionType.TRANSFER,
          quantity: 50,
          fromLocation: '507f1f77bcf86cd799439012',
          toLocation: '507f1f77bcf86cd799439013',
          performedBy: '507f1f77bcf86cd799439016',
          notes: 'Rebalancing stock between Nairobi and Mombasa warehouses',
        },
      },
      allocation: {
        summary: 'Project Allocation',
        description: 'Reserve stock for a specific project',
        value: {
          inventoryItem: '507f1f77bcf86cd799439011',
          transactionType: TransactionType.ALLOCATION,
          quantity: 30,
          fromLocation: '507f1f77bcf86cd799439012',
          project: '507f1f77bcf86cd799439014',
          performedBy: '507f1f77bcf86cd799439016',
          notes: 'Reserved for Thika substation upgrade project',
        },
      },
      adjustment: {
        summary: 'Stock Adjustment',
        description: 'Correct stock levels after inventory count',
        value: {
          inventoryItem: '507f1f77bcf86cd799439011',
          transactionType: TransactionType.ADJUSTMENT_OUT,
          quantity: 5,
          fromLocation: '507f1f77bcf86cd799439012',
          performedBy: '507f1f77bcf86cd799439016',
          notes: 'Adjustment after physical inventory count showed discrepancy',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Transaction created successfully',
    type: () => ApiResponseDto<TransactionResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Referenced item or location not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Insufficient stock for the requested transaction',
  })
  createTransaction(@Body() createTransactionDto: CreateTransactionDto) {
    return this.inventoryService.createTransaction(createTransactionDto);
  }

  @Get('transactions')
  @ApiOperation({
    summary: 'Get all inventory transactions with filtering and pagination',
    description:
      'Retrieve transactions with optional filtering by date range, transaction type, inventory item, location, and more',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (starts from 1)',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'transactionType',
    required: false,
    description: 'Filter by transaction type',
    enum: TransactionType,
    example: TransactionType.PURCHASE,
  })
  @ApiQuery({
    name: 'inventoryItem',
    required: false,
    description: 'Filter by inventory item ID',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'fromLocation',
    required: false,
    description: 'Filter by source location ID',
    type: String,
  })
  @ApiQuery({
    name: 'toLocation',
    required: false,
    description: 'Filter by destination location ID',
    type: String,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter by transactions on or after this date (ISO format)',
    type: String,
    example: '2024-06-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter by transactions on or before this date (ISO format)',
    type: String,
    example: '2024-06-30T23:59:59.999Z',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transactions retrieved successfully',
    type: () => PaginatedResponseDto<TransactionResponseDto>,
  })
  findAllTransactions(@Query() query: TransactionQueryDto) {
    return this.inventoryService.findAllTransactions(query);
  }

  // ========================= SUPPLIER ENDPOINTS =========================

  @Post('suppliers')
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Supplier created successfully',
    type: () => ApiResponseDto<SupplierResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Supplier with same name already exists',
  })
  createSupplier(@Body() createSupplierDto: CreateSupplierDto) {
    return this.inventoryService.createSupplier(createSupplierDto);
  }

  @Get('suppliers')
  @ApiOperation({ summary: 'Get all suppliers with pagination and search' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Suppliers retrieved successfully',
    type: () => PaginatedResponseDto<SupplierResponseDto>,
  })
  findAllSuppliers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.inventoryService.findAllSuppliers(page, limit, search);
  }

  @Get('suppliers/:id')
  @ApiOperation({ summary: 'Get a specific supplier by ID' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Supplier retrieved successfully',
    type: () => ApiResponseDto<SupplierResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Supplier not found',
  })
  findSupplierById(@Param('id') id: string) {
    return this.inventoryService.findSupplierById(id);
  }

  @Patch('suppliers/:id')
  @ApiOperation({ summary: 'Update a supplier' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Supplier updated successfully',
    type: () => ApiResponseDto<SupplierResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Supplier not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  updateSupplier(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.inventoryService.updateSupplier(id, updateSupplierDto);
  }

  @Delete('suppliers/:id')
  @ApiOperation({ summary: 'Delete a supplier' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Supplier deleted successfully',
    type: () => ApiResponseDto<void>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Supplier not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete supplier with existing transactions',
  })
  deleteSupplier(@Param('id') id: string): Promise<ApiResponseDto<void>> {
    return this.inventoryService.deleteSupplier(id);
  }

  // ========================= STOCK MANAGEMENT ENDPOINTS =========================

  @Post('stock/adjust')
  @ApiOperation({
    summary: 'Adjust stock level for an item at a specific location',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Stock adjusted successfully',
    type: () => ApiResponseDto<TransactionResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Item or location not found',
  })
  adjustStock(@Body() adjustmentDto: StockAdjustmentDto) {
    return this.inventoryService.adjustStock(adjustmentDto);
  }

  @Post('stock/bulk-update')
  @ApiOperation({ summary: 'Perform bulk stock updates' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bulk stock update completed successfully',
    type: () => ApiResponseDto<TransactionResponseDto[]>,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  bulkUpdateStock(
    @Body() bulkUpdateDto: BulkUpdateStockDto,
  ): Promise<ApiResponseDto<TransactionResponseDto[]>> {
    return this.inventoryService.bulkUpdateStock(bulkUpdateDto);
  }

  @Post('stock/reserved')
  @ApiOperation({ summary: 'Update reserved stock for an inventory item at a specific location' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reserved stock updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Reserved stock updated successfully (INCREASE)',
        data: {
          _id: '60f7a9c8c2b4a12e6c8b4567',
          itemName: 'Example Item',
          itemCode: 'EX-001',
          stockLevels: [
            {
              location: '60f7a9c8c2b4a12e6c8b4568',
              currentStock: 100,
              reservedStock: 20,
              availableStock: 80,
              minimumLevel: 10,
              reorderPoint: 30,
            },
          ],
          totalStock: 100,
          totalReserved: 20,
          totalAvailable: 80,
          stockStatus: 'IN_STOCK',
        },
        timestamp: '2025-06-02T15:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or operation not allowed',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Item or location not found',
  })
  updateReservedStock(@Body() dto: ReservedStockUpdateDto) {
    return this.inventoryService.updateReservedStock(dto);
  }

  // ========================= REPORTING ENDPOINTS =========================

  @Get('reports/stock')
  @ApiOperation({ summary: 'Generate stock level report' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Stock report generated successfully',
  })
  generateStockReport(@Query() reportParams: StockReportDto) {
    return this.inventoryService.getStockReport(reportParams);
  }

  @Get('reports/movements')
  @ApiOperation({ summary: 'Generate stock movement report' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Stock movement report generated successfully',
  })
  generateMovementReport(@Query() reportParams: StockMovementReportDto) {
    return this.inventoryService.getMovementReport(reportParams);
  }

  @Get('reports/valuation')
  @ApiOperation({ summary: 'Generate inventory valuation report' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inventory valuation report generated successfully',
  })
  generateValuationReport() {
    return this.inventoryService.getInventoryValuation();
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get inventory dashboard statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dashboard statistics retrieved successfully',
    type: () => ApiResponseDto<DashboardStatsDto>,
  })
  getDashboardStats(): Promise<ApiResponseDto<DashboardStatsDto>> {
    return this.inventoryService.getDashboardStats();
  }
}
