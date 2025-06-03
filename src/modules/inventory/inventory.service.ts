import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import {
  InventoryItem,
  InventoryTransaction,
  Supplier,
  StockLocation,
  StockStatus,
  TransactionType,
  ItemCategory,
} from './inventory.schema';
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
  InventoryValuationDto,
  DashboardStatsDto,
  ReservedStockUpdateDto,
  ReservedStockAction,
} from './inventory.dto';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectModel(InventoryItem.name)
    private inventoryModel: Model<InventoryItem>,
    @InjectModel(InventoryTransaction.name)
    private transactionModel: Model<InventoryTransaction>,
    @InjectModel(Supplier.name) private supplierModel: Model<Supplier>,
    @InjectModel(StockLocation.name)
    private stockLocationModel: Model<StockLocation>,
  ) {}

  /**
   * Calculates stock totals and status for a given inventory item ID.
   * Returns the item with totalStock, totalReserved, totalAvailable, and stockStatus populated.
   */
  async calculateItemStats(itemId: string) {
    const item = await this.inventoryModel
      .findById(itemId)
      .populate('stockLevels.location', 'name address city')
      .lean();
    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${itemId} not found`);
    }
    // Calculate totals
    let totalStock = 0;
    let totalReserved = 0;
    let totalAvailable = 0;
    if (Array.isArray(item.stockLevels)) {
      for (const sl of item.stockLevels) {
        totalStock += sl.currentStock || 0;
        totalReserved += sl.reservedStock || 0;
        totalAvailable +=
          sl.availableStock ?? (sl.currentStock || 0) - (sl.reservedStock || 0);
      }
    }
    // Determine stock status
    let stockStatus = StockStatus.IN_STOCK;
    if (totalStock === 0) {
      stockStatus = StockStatus.OUT_OF_STOCK;
    } else if (
      item.stockLevels &&
      item.stockLevels.some((sl) => sl.currentStock <= (sl.minimumLevel || 0))
    ) {
      stockStatus = StockStatus.LOW_STOCK;
    }
    // Attach calculated fields
    return {
      ...item,
      totalStock,
      totalReserved,
      totalAvailable,
      stockStatus,
    };
  }

  // ========================= INVENTORY ITEM OPERATIONS =========================

  // Creates a new warehouse/stock location
  async createStockLocation(createStockLocationDto: CreateStockLocationDto) {
    try {
      // Check for duplicate name (optional, can remove if not needed)
      const existing = await this.stockLocationModel.findOne({
        name: createStockLocationDto.name,
      });
      if (existing) {
        throw new ConflictException(
          `Stock location with name '${createStockLocationDto.name}' already exists`,
        );
      }
      const created = new this.stockLocationModel(createStockLocationDto);
      const saved = await created.save();
      return {
        success: true,
        message: 'Warehouse/stock location created successfully',
        data: saved.toObject(),
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Error creating stock location: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // Get all warehouses/stock locations
  async getAllWarehouses() {
    try {
      const locations = await this.stockLocationModel.find().lean();
      return {
        success: true,
        message: 'Warehouses retrieved successfully',
        data: locations,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Error fetching warehouses: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // Get warehouse/stock location by ID
  async getWarehouseById(id: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid warehouse ID format');
      }
      const location = await this.stockLocationModel.findById(id).lean();
      if (!location) {
        throw new NotFoundException(`Warehouse with ID ${id} not found`);
      }
      return {
        success: true,
        message: 'Warehouse retrieved successfully',
        data: location,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Error fetching warehouse by ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateWarehouseById(
    id: string,
    updateStockLocationDto: UpdateStockLocationDto,
  ) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid warehouse ID format');
      }
      const updated = await this.stockLocationModel
        .findByIdAndUpdate(id, updateStockLocationDto)
        .lean();
      if (!updated) {
        throw new NotFoundException(`Warehouse with ID ${id} not found`);
      }
      return {
        success: true,
        message: 'Warehouse updated successfully',
        data: updated,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Error updating warehouse by ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async deleteWarehouseById(id: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid warehouse ID format');
      }
      const deleted = await this.stockLocationModel
        .findByIdAndDelete(id)
        .lean();
      if (!deleted) {
        throw new NotFoundException(`Warehouse with ID ${id} not found`);
      }
      return {
        success: true,
        message: 'Warehouse deleted successfully',
        data: deleted,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Error deleting warehouse by ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async createInventoryItem(createItemDto: CreateInventoryItemDto) {
    try {
      // Check if item code already exists
      const existingItem = await this.inventoryModel.findOne({
        itemCode: createItemDto.itemCode,
      });
      if (existingItem) {
        throw new ConflictException(
          `Item with code ${createItemDto.itemCode} already exists`,
        );
      }

      // Validate locations exist
      const locationIds = createItemDto.stockLevels.map((sl) => sl.location);
      const locations = await this.stockLocationModel.find({
        _id: { $in: locationIds },
      });
      if (locations.length !== locationIds.length) {
        throw new BadRequestException(
          'One or more stock locations do not exist',
        );
      }

      // Create the inventory item
      const inventoryItem = new this.inventoryModel({
        ...createItemDto,
        stockLevels: createItemDto.stockLevels.map((sl) => ({
          ...sl,
          location: new Types.ObjectId(sl.location),
        })),
      });

      const savedItem = await inventoryItem.save();

      // Calculate stock totals and status
      const itemWithStats = await this.calculateItemStats(
        savedItem._id.toString(),
      );

      this.logger.log(`Created inventory item: ${savedItem.itemCode}`);

      return {
        success: true,
        message: 'Inventory item created successfully',
        data: itemWithStats,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Error creating inventory item: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAllInventoryItems(query: InventoryQueryDto) {
    try {
      const {
        search,
        category,
        stockStatus,
        supplier,
        isActive = true,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = query;

      // Build filter
      const filter: any = { isActive };

      if (search) {
        filter.$or = [
          { itemName: { $regex: search, $options: 'i' } },
          { itemCode: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { alternativeCodes: { $in: [new RegExp(search, 'i')] } },
        ];
      }

      if (category) {
        filter.category = category;
      }

      if (supplier) {
        filter.supplier = { $regex: supplier, $options: 'i' };
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sortOptions: any = {};
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute query with population
      const [items, total] = await Promise.all([
        this.inventoryModel
          .find(filter)
          .populate('stockLevels.location', 'name address city')
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        this.inventoryModel.countDocuments(filter),
      ]);

      // Calculate stats for each item and filter by stock status if needed
      const itemsWithStats = await Promise.all(
        items.map(async (item) => {
          return await this.calculateItemStats(item._id.toString());
        }),
      );

      // Filter by stock status after calculating stats
      let filteredItems = itemsWithStats;
      if (stockStatus) {
        filteredItems = itemsWithStats.filter(
          (item) => item.stockStatus === stockStatus,
        );
      }

      const totalPages = Math.ceil(total / limit);

      return {
        data: filteredItems,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    } catch (error) {
      this.logger.error(
        `Error finding inventory items: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findInventoryItemById(id: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid item ID format');
      }

      const item = await this.inventoryModel
        .findById(id)
        .populate('stockLevels.location', 'name address city')
        .lean();

      if (!item) {
        throw new NotFoundException(`Inventory item with ID ${id} not found`);
      }

      const itemWithStats = await this.calculateItemStats(item._id.toString());

      return {
        success: true,
        message: 'Inventory item found',
        data: itemWithStats,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Error finding inventory item by ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateInventoryItem(id: string, updateItemDto: UpdateInventoryItemDto) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid item ID format');
      }

      // Check if item exists
      const existingItem = await this.inventoryModel.findById(id);
      if (!existingItem) {
        throw new NotFoundException(`Inventory item with ID ${id} not found`);
      }

      // If updating item code, check for conflicts
      if (
        updateItemDto.itemCode &&
        updateItemDto.itemCode !== existingItem.itemCode
      ) {
        const conflictItem = await this.inventoryModel.findOne({
          itemCode: updateItemDto.itemCode,
          _id: { $ne: id },
        });
        if (conflictItem) {
          throw new ConflictException(
            `Item with code ${updateItemDto.itemCode} already exists`,
          );
        }
      }

      // Validate locations if stock levels are being updated
      if (updateItemDto.stockLevels) {
        const locationIds = updateItemDto.stockLevels.map((sl) => sl.location);
        const locations = await this.stockLocationModel.find({
          _id: { $in: locationIds },
        });
        if (locations.length !== locationIds.length) {
          throw new BadRequestException(
            'One or more stock locations do not exist',
          );
        }
      }

      const updatedItem = await this.inventoryModel
        .findByIdAndUpdate(
          id,
          {
            ...updateItemDto,
            updatedAt: new Date(),
            ...(updateItemDto.stockLevels && {
              stockLevels: updateItemDto.stockLevels.map((sl) => ({
                ...sl,
                location: new Types.ObjectId(sl.location),
              })),
            }),
          },
          { new: true },
        )
        .populate('stockLevels.location', 'name address city');

      const itemWithStats = await this.calculateItemStats(
        updatedItem._id.toString(),
      );

      this.logger.log(`Updated inventory item: ${updatedItem.itemCode}`);

      return {
        success: true,
        message: 'Inventory item updated successfully',
        data: itemWithStats,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Error updating inventory item: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async deleteInventoryItem(id: string): Promise<ApiResponseDto<void>> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid item ID format');
      }

      // Check if item has transactions
      const hasTransactions = await this.transactionModel.exists({
        inventoryItem: id,
      });
      if (hasTransactions) {
        // Soft delete by marking as inactive
        await this.inventoryModel.findByIdAndUpdate(id, { isActive: false });
        this.logger.log(`Soft deleted inventory item with ID: ${id}`);

        return {
          success: true,
          message: 'Inventory item deactivated (has transaction history)',
          timestamp: new Date(),
        };
      }

      const deletedItem = await this.inventoryModel.findByIdAndDelete(id);
      if (!deletedItem) {
        throw new NotFoundException(`Inventory item with ID ${id} not found`);
      }

      this.logger.log(`Hard deleted inventory item: ${deletedItem.itemCode}`);

      return {
        success: true,
        message: 'Inventory item deleted successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Error deleting inventory item: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // ========================= TRANSACTION OPERATIONS =========================

  /**
   * Validates that fromLocation and toLocation (if present) exist in the StockLocation collection.
   * Returns { valid: boolean, message?: string }
   */
  async validateTransactionLocations(
    createTransactionDto: CreateTransactionDto,
  ): Promise<{ valid: boolean; message?: string }> {
    const locationIds = [];
    if (createTransactionDto.fromLocation)
      locationIds.push(createTransactionDto.fromLocation);
    if (createTransactionDto.toLocation)
      locationIds.push(createTransactionDto.toLocation);
    if (locationIds.length === 0) return { valid: true };
    const found = await this.stockLocationModel.countDocuments({
      _id: { $in: locationIds },
    });
    if (found !== locationIds.length) {
      return {
        valid: false,
        message: 'One or more provided stock locations do not exist',
      };
    }
    return { valid: true };
  }

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    try {
      // Validate inventory item exists
      const inventoryItem = await this.inventoryModel.findById(
        createTransactionDto.inventoryItem,
      );
      if (!inventoryItem) {
        throw new NotFoundException('Inventory item not found');
      }

      // Validate locations
      const locationValidation =
        await this.validateTransactionLocations(createTransactionDto);
      if (!locationValidation.valid) {
        throw new BadRequestException(locationValidation.message);
      }

      // Record stock before transaction
      const stockBefore = await this.calculateItemStats(
        inventoryItem._id.toString(),
      );

      // Create transaction
      const transaction = new this.transactionModel({
        ...createTransactionDto,
        transactionDate: createTransactionDto.transactionDate || new Date(),
        inventoryItem: new Types.ObjectId(createTransactionDto.inventoryItem),
        ...(createTransactionDto.fromLocation && {
          fromLocation: new Types.ObjectId(createTransactionDto.fromLocation),
        }),
        ...(createTransactionDto.toLocation && {
          toLocation: new Types.ObjectId(createTransactionDto.toLocation),
        }),
        ...(createTransactionDto.supplier && {
          supplier: new Types.ObjectId(createTransactionDto.supplier),
        }),
        ...(createTransactionDto.project && {
          project: new Types.ObjectId(createTransactionDto.project),
        }),
        performedBy: new Types.ObjectId(createTransactionDto.performedBy),
        stockBefore: stockBefore.totalStock,
      });

      const savedTransaction = await transaction.save();

      // Update stock levels based on transaction type
      await this.updateStockLevels(createTransactionDto);

      // Calculate stock after transaction
      const updatedItem = await this.inventoryModel.findById(
        createTransactionDto.inventoryItem,
      );
      const stockAfter = this.calculateStockStats(updatedItem);

      // Update transaction with stock after
      savedTransaction.stockAfter = (await stockAfter).totalStock;
      await savedTransaction.save();

      const populatedTransaction = await this.transactionModel
        .findById(savedTransaction._id)
        .populate('inventoryItem', 'itemName itemCode')
        .populate('fromLocation', 'name')
        .populate('toLocation', 'name')
        .populate('supplier', 'companyName')
        .populate('performedBy', 'name email');

      this.logger.log(
        `Created transaction: ${savedTransaction.transactionRef}`,
      );

      return {
        success: true,
        message: 'Transaction created successfully',
        data: populatedTransaction.toObject(),
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Error creating transaction: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAllTransactions(query: TransactionQueryDto) {
    try {
      const {
        inventoryItem,
        transactionType,
        dateFrom,
        dateTo,
        page = 1,
        limit = 20,
      } = query;

      // Build filter
      const filter: any = {};

      if (inventoryItem) {
        filter.inventoryItem = new Types.ObjectId(inventoryItem);
      }

      if (transactionType) {
        filter.transactionType = transactionType;
      }

      if (dateFrom || dateTo) {
        filter.transactionDate = {};
        if (dateFrom) filter.transactionDate.$gte = dateFrom;
        if (dateTo) filter.transactionDate.$lte = dateTo;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute query with population
      const [transactions, total] = await Promise.all([
        this.transactionModel
          .find(filter)
          .populate('inventoryItem', 'itemName itemCode')
          .populate('fromLocation', 'name')
          .populate('toLocation', 'name')
          .populate('supplier', 'companyName')
          .populate('performedBy', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.transactionModel.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: transactions,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    } catch (error) {
      this.logger.error(
        `Error finding transactions: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // ========================= STOCK OPERATIONS =========================

  /**
   * Updates stock levels for an inventory item based on transaction type.
   * Handles all transaction types: PURCHASE, SALE, TRANSFER, ADJUSTMENT_IN, ADJUSTMENT_OUT, etc.
   */
  async updateStockLevels(
    createTransactionDto: CreateTransactionDto,
  ): Promise<void> {
    const {
      inventoryItem,
      transactionType,
      quantity,
      fromLocation,
      toLocation,
    } = createTransactionDto;
    const item = await this.inventoryModel.findById(inventoryItem);
    if (!item) throw new NotFoundException('Inventory item not found');

    // Helper to find stockLevel by location
    const findLevel = (locId: string) =>
      item.stockLevels.find(
        (level: any) => level.location.toString() === locId,
      );

    try {
      switch (transactionType) {
        case TransactionType.PURCHASE:
        case TransactionType.RETURN:
        case TransactionType.ADJUSTMENT_IN: {
          // Increase stock at toLocation
          if (!toLocation) throw new BadRequestException('toLocation required');
          const level = findLevel(toLocation);
          if (!level)
            throw new NotFoundException(
              'Destination location not found in stockLevels',
            );
          level.currentStock += quantity;
          break;
        }
        case TransactionType.SALE:
        case TransactionType.CONSUMPTION:
        case TransactionType.DAMAGE:
        case TransactionType.MAINTENANCE:
        case TransactionType.ADJUSTMENT_OUT: {
          // Decrease stock at fromLocation
          if (!fromLocation)
            throw new BadRequestException('fromLocation required');
          const level = findLevel(fromLocation);
          if (!level)
            throw new NotFoundException(
              'Source location not found in stockLevels',
            );
          if (level.currentStock < quantity)
            throw new BadRequestException(
              `Insufficient stock at source location. Available: ${level.currentStock}, Requested: ${quantity}`,
            );
          level.currentStock -= quantity;
          break;
        }
        case TransactionType.TRANSFER: {
          // Move stock from fromLocation to toLocation
          if (!fromLocation || !toLocation)
            throw new BadRequestException(
              'Both fromLocation and toLocation required',
            );
          const fromLevel = findLevel(fromLocation);
          const toLevel = findLevel(toLocation);
          if (!fromLevel || !toLevel)
            throw new NotFoundException('Location not found in stockLevels');
          if (fromLevel.currentStock < quantity)
            throw new BadRequestException(
              `Insufficient stock at source location. Available: ${fromLevel.currentStock}, Requested: ${quantity}`,
            );
          fromLevel.currentStock -= quantity;
          toLevel.currentStock += quantity;
          break;
        }
        case TransactionType.ALLOCATION: {
          // Reserve stock at a location (doesn't change currentStock, only reservedStock)
          if (!fromLocation)
            throw new BadRequestException('fromLocation required');
          const level = findLevel(fromLocation);
          if (!level)
            throw new NotFoundException(
              'Source location not found in stockLevels',
            );

          // Initialize reservedStock if undefined
          level.reservedStock = level.reservedStock || 0;

          // Check if there's enough available stock (current - reserved)
          const availableStock = level.currentStock - level.reservedStock;
          if (availableStock < quantity)
            throw new BadRequestException(
              `Insufficient available stock at source location. Available: ${availableStock}, Requested: ${quantity}`,
            );

          // Increase reserved stock
          level.reservedStock += quantity;

          // Update available stock (will be clamped to 0 in pre-save hook if negative)
          level.availableStock = Math.max(
            0,
            level.currentStock - level.reservedStock,
          );
          break;
        }
        default:
          throw new BadRequestException(
            `Unsupported transaction type: ${transactionType}`,
          );
      }

      // Update available stock for all affected stock levels
      item.stockLevels.forEach((level) => {
        // Ensure reservedStock is initialized
        level.reservedStock = level.reservedStock || 0;
        // Ensure availableStock is never negative
        level.availableStock = Math.max(
          0,
          level.currentStock - level.reservedStock,
        );
      });

      // Save item
      await item.save();
    } catch (error) {
      this.logger.error(
        `Error updating stock levels: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Returns stock summary for an inventory item (totalStock, totalReserved, totalAvailable).
   * Accepts either the item document or a plain object with stockLevels.
   */
  async calculateStockStats(itemOrDoc: any): Promise<{
    totalStock: number;
    totalReserved: number;
    totalAvailable: number;
  }> {
    let stockLevels = itemOrDoc.stockLevels;
    // If only ID is provided, fetch the item
    if (!stockLevels && itemOrDoc._id) {
      const item = await this.inventoryModel.findById(itemOrDoc._id).lean();
      stockLevels = item?.stockLevels || [];
    }
    let totalStock = 0,
      totalReserved = 0,
      totalAvailable = 0;
    if (Array.isArray(stockLevels)) {
      for (const sl of stockLevels) {
        totalStock += sl.currentStock || 0;
        totalReserved += sl.reservedStock || 0;
        totalAvailable +=
          typeof sl.availableStock === 'number'
            ? sl.availableStock
            : (sl.currentStock || 0) - (sl.reservedStock || 0);
      }
    }
    return { totalStock, totalReserved, totalAvailable };
  }

  // ========================= SUPPLIER OPERATIONS =========================

  async createSupplier(createSupplierDto: CreateSupplierDto) {
    try {
      // Check if supplier with same company name exists
      const existingSupplier = await this.supplierModel.findOne({
        companyName: createSupplierDto.companyName,
      });
      if (existingSupplier) {
        throw new ConflictException(
          `Supplier with company name ${createSupplierDto.companyName} already exists`,
        );
      }

      const supplier = new this.supplierModel({
        ...createSupplierDto,
        country: createSupplierDto.country || 'Kenya',
      });

      const savedSupplier = await supplier.save();

      this.logger.log(`Created supplier: ${savedSupplier.companyName}`);

      return {
        success: true,
        message: 'Supplier created successfully',
        data: savedSupplier.toObject(),
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Error creating supplier: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAllSuppliers(page = 1, limit = 20, search?: string) {
    try {
      const filter: any = {};

      if (search) {
        filter.$or = [
          { companyName: { $regex: search, $options: 'i' } },
          { contactPerson: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (page - 1) * limit;

      const [suppliers, total] = await Promise.all([
        this.supplierModel
          .find(filter)
          .sort({ companyName: 1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.supplierModel.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: suppliers,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    } catch (error) {
      this.logger.error(
        `Error finding suppliers: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findSupplierById(id: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid supplier ID format');
      }

      const supplier = await this.supplierModel.findById(id).lean();
      if (!supplier) {
        throw new NotFoundException(`Supplier with ID ${id} not found`);
      }

      return {
        success: true,
        message: 'Supplier found',
        data: supplier,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Error finding supplier by ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateSupplier(id: string, updateSupplierDto: UpdateSupplierDto) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid supplier ID format');
      }

      // Check if supplier exists
      const existingSupplier = await this.supplierModel.findById(id);
      if (!existingSupplier) {
        throw new NotFoundException(`Supplier with ID ${id} not found`);
      }

      // Check for company name conflicts if updating
      if (
        updateSupplierDto.companyName &&
        updateSupplierDto.companyName !== existingSupplier.companyName
      ) {
        const conflictSupplier = await this.supplierModel.findOne({
          companyName: updateSupplierDto.companyName,
          _id: { $ne: id },
        });
        if (conflictSupplier) {
          throw new ConflictException(
            `Supplier with company name ${updateSupplierDto.companyName} already exists`,
          );
        }
      }

      const updatedSupplier = await this.supplierModel
        .findByIdAndUpdate(
          id,
          { ...updateSupplierDto, updatedAt: new Date() },
          { new: true },
        )
        .lean();

      this.logger.log(`Updated supplier: ${updatedSupplier.companyName}`);

      return {
        success: true,
        message: 'Supplier updated successfully',
        data: updatedSupplier,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Error updating supplier: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async deleteSupplier(id: string): Promise<ApiResponseDto<void>> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid supplier ID format');
      }

      // Check if supplier has transactions
      const hasTransactions = await this.transactionModel.exists({
        supplier: id,
      });
      if (hasTransactions) {
        throw new BadRequestException(
          'Cannot delete supplier with existing transactions',
        );
      }

      const deletedSupplier = await this.supplierModel.findByIdAndDelete(id);
      if (!deletedSupplier) {
        throw new NotFoundException(`Supplier with ID ${id} not found`);
      }

      this.logger.log(`Deleted supplier: ${deletedSupplier.companyName}`);

      return {
        success: true,
        message: 'Supplier deleted successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Error deleting supplier: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // ========================= STOCK MANAGEMENT OPERATIONS =========================

  async adjustStock(adjustmentDto: StockAdjustmentDto) {
    try {
      // Create adjustment transaction
      const transactionDto: CreateTransactionDto = {
        transactionRef: `ADJ-${Date.now()}`,
        inventoryItem: adjustmentDto.itemId,
        transactionType:
          adjustmentDto.adjustmentQuantity > 0
            ? TransactionType.ADJUSTMENT_IN
            : TransactionType.ADJUSTMENT_OUT,
        quantity: Math.abs(adjustmentDto.adjustmentQuantity),
        toLocation:
          adjustmentDto.adjustmentQuantity > 0
            ? adjustmentDto.locationId
            : undefined,
        fromLocation:
          adjustmentDto.adjustmentQuantity < 0
            ? adjustmentDto.locationId
            : undefined,
        performedBy: adjustmentDto.performedBy,
        notes: adjustmentDto.reason,
        documentRef: adjustmentDto.documentRef,
      };

      return await this.createTransaction(transactionDto);
    } catch (error) {
      this.logger.error(`Error adjusting stock: ${error.message}`, error.stack);
      throw error;
    }
  }

  async bulkUpdateStock(bulkUpdateDto: BulkUpdateStockDto) {
    try {
      const transactions = [];

      for (const update of bulkUpdateDto.updates) {
        let quantity = update.quantity;
        let transactionType: TransactionType;

        switch (update.operation) {
          case 'add':
            transactionType = TransactionType.ADJUSTMENT_IN;
            break;
          case 'subtract':
            transactionType = TransactionType.ADJUSTMENT_OUT;
            break;
          case 'set':
            // Calculate difference
            const currentItem = await this.inventoryModel.findById(
              update.itemId,
            );
            const currentLocationStock = currentItem.stockLevels.find(
              (sl) => sl.location.toString() === update.locationId,
            );

            if (currentLocationStock) {
              const difference = quantity - currentLocationStock.currentStock;
              quantity = Math.abs(difference);
              transactionType =
                difference > 0
                  ? TransactionType.ADJUSTMENT_IN
                  : TransactionType.ADJUSTMENT_OUT;
            } else {
              transactionType = TransactionType.ADJUSTMENT_IN;
            }
            break;
        }

        if (quantity > 0) {
          const transactionDto: CreateTransactionDto = {
            transactionRef: `BULK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            inventoryItem: update.itemId,
            transactionType,
            quantity,
            toLocation:
              transactionType === TransactionType.ADJUSTMENT_IN
                ? update.locationId
                : undefined,
            fromLocation:
              transactionType === TransactionType.ADJUSTMENT_OUT
                ? update.locationId
                : undefined,
            performedBy: bulkUpdateDto.performedBy,
            notes: bulkUpdateDto.reason || 'Bulk stock update',
          };

          const result = await this.createTransaction(transactionDto);
          transactions.push(result.data);
        }
      }

      this.logger.log(
        `Completed bulk stock update: ${transactions.length} transactions`,
      );

      return {
        success: true,
        message: `Bulk stock update completed: ${transactions.length} transactions processed`,
        data: transactions,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Error in bulk stock update: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // ========================= REPORTING OPERATIONS =========================

  async getStockReport(
    reportDto: StockReportDto,
  ): Promise<ApiResponseDto<any>> {
    try {
      const filter: any = { isActive: true };

      if (reportDto.category) {
        filter.category = reportDto.category;
      }

      let pipeline: any[] = [
        { $match: filter },
        {
          $lookup: {
            from: 'stocklocations',
            localField: 'stockLevels.location',
            foreignField: '_id',
            as: 'locationDetails',
          },
        },
      ];

      if (reportDto.locationId) {
        pipeline.push({
          $match: {
            'stockLevels.location': new Types.ObjectId(reportDto.locationId),
          },
        });
      }

      pipeline.push({
        $project: {
          itemName: 1,
          itemCode: 1,
          category: 1,
          stockLevels: 1,
          pricing: 1,
          totalStock: {
            $sum: '$stockLevels.currentStock',
          },
          totalReserved: {
            $sum: '$stockLevels.reservedStock',
          },
          totalAvailable: {
            $subtract: [
              { $sum: '$stockLevels.currentStock' },
              { $sum: '$stockLevels.reservedStock' },
            ],
          },
          isLowStock: {
            $anyElementTrue: {
              $map: {
                input: '$stockLevels',
                as: 'level',
                in: { $lte: ['$$level.currentStock', '$$level.minimumLevel'] },
              },
            },
          },
        },
      });

      if (reportDto.lowStockOnly) {
        pipeline.push({
          $match: { isLowStock: true },
        });
      }

      if (reportDto.includeValuation) {
        pipeline.push({
          $addFields: {
            totalValue: {
              $multiply: ['$totalStock', '$pricing.standardCost'],
            },
          },
        });
      }

      const stockReport = await this.inventoryModel.aggregate(pipeline);

      return {
        success: true,
        message: 'Stock report generated successfully',
        data: {
          items: stockReport,
          summary: {
            totalItems: stockReport.length,
            totalValue: reportDto.includeValuation
              ? stockReport.reduce(
                  (sum, item) => sum + (item.totalValue || 0),
                  0,
                )
              : 0,
            lowStockItems: stockReport.filter((item) => item.isLowStock).length,
          },
        },
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Error generating stock report: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getMovementReport(
    reportDto: StockMovementReportDto,
  ): Promise<ApiResponseDto<any>> {
    try {
      const filter: any = {};

      if (reportDto.itemId) {
        filter.inventoryItem = new Types.ObjectId(reportDto.itemId);
      }

      if (reportDto.locationId) {
        filter.$or = [
          { fromLocation: new Types.ObjectId(reportDto.locationId) },
          { toLocation: new Types.ObjectId(reportDto.locationId) },
        ];
      }

      filter.transactionDate = {
        $gte: reportDto.startDate,
        $lte: reportDto.endDate,
      };

      const pipeline = [
        { $match: filter },
        {
          $lookup: {
            from: 'inventoryitems',
            localField: 'inventoryItem',
            foreignField: '_id',
            as: 'itemDetails',
          },
        },
        {
          $lookup: {
            from: 'stocklocations',
            localField: 'fromLocation',
            foreignField: '_id',
            as: 'fromLocationDetails',
          },
        },
        {
          $lookup: {
            from: 'stocklocations',
            localField: 'toLocation',
            foreignField: '_id',
            as: 'toLocationDetails',
          },
        },
        {
          $project: {
            transactionRef: 1,
            transactionType: 1,
            transactionDate: 1,
            quantity: 1,
            documentRef: 1,
            notes: 1,
            item: {
              _id: { $arrayElemAt: ['$itemDetails._id', 0] },
              itemName: { $arrayElemAt: ['$itemDetails.itemName', 0] },
              itemCode: { $arrayElemAt: ['$itemDetails.itemCode', 0] },
            },
            fromLocation: {
              _id: { $arrayElemAt: ['$fromLocationDetails._id', 0] },
              name: { $arrayElemAt: ['$fromLocationDetails.name', 0] },
            },
            toLocation: {
              _id: { $arrayElemAt: ['$toLocationDetails._id', 0] },
              name: { $arrayElemAt: ['$toLocationDetails.name', 0] },
            },
            stockBefore: '$stockBefore',
            stockAfter: '$stockAfter',
          },
        },
        { $sort: { transactionDate: -1 } },
      ];

      const movements = await this.transactionModel.aggregate(
        pipeline as any[],
      );

      // Calculate summary statistics
      const summary = {
        totalMovements: movements.length,
        totalQuantity: movements.reduce((sum, m) => sum + m.quantity, 0),
        byType: {},
      };

      // Group by transaction type
      movements.forEach((m) => {
        if (!summary.byType[m.transactionType]) {
          summary.byType[m.transactionType] = {
            count: 0,
            quantity: 0,
          };
        }
        summary.byType[m.transactionType].count++;
        summary.byType[m.transactionType].quantity += m.quantity;
      });

      return {
        success: true,
        message: 'Stock movement report generated successfully',
        data: {
          movements,
          summary,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Error generating stock movement report: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getInventoryValuation(): Promise<
    ApiResponseDto<InventoryValuationDto[]>
  > {
    try {
      const valuationPipeline = [
        { $match: { isActive: true } },
        {
          $project: {
            item: {
              _id: '$_id',
              itemName: '$itemName',
              itemCode: '$itemCode',
              category: '$category',
            },
            currentStock: { $sum: '$stockLevels.currentStock' },
            standardCost: '$pricing.standardCost',
            lastPurchasePrice: '$pricing.lastPurchasePrice',
          },
        },
        {
          $addFields: {
            totalValue: { $multiply: ['$currentStock', '$standardCost'] },
            lastPurchaseValue: {
              $multiply: ['$currentStock', '$lastPurchasePrice'],
            },
          },
        },
        { $match: { currentStock: { $gt: 0 } } },
        { $sort: { totalValue: -1 } },
      ] as any[];

      const valuation = await this.inventoryModel.aggregate(valuationPipeline);

      return {
        success: true,
        message: 'Inventory valuation retrieved successfully',
        data: valuation,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Error getting inventory valuation: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Updates reserved stock for an inventory item at a specific location
   * Supports increasing, decreasing, or completely unreserving stock
   */
  async updateReservedStock(
    dto: ReservedStockUpdateDto,
  ): Promise<ApiResponseDto<any>> {
    const { inventoryItem, location, action, quantity, performedBy } = dto;

    // Validate inputs
    if (
      (action === ReservedStockAction.INCREASE ||
        action === ReservedStockAction.DECREASE) &&
      !quantity
    ) {
      throw new BadRequestException(
        'Quantity is required for increase/decrease actions',
      );
    }

    // Find the inventory item
    const item = await this.inventoryModel.findById(inventoryItem);
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    // Find the stock level for the specified location
    const stockLevel = item.stockLevels.find(
      (level) => level.location.toString() === location,
    );

    if (!stockLevel) {
      throw new NotFoundException('Location not found in item stock levels');
    }

    // Initialize reservedStock if undefined
    stockLevel.reservedStock = stockLevel.reservedStock || 0;

    try {
      // Update reserved stock based on action
      switch (action) {
        case ReservedStockAction.INCREASE:
          // Check if there's enough available stock
          const availableForReservation =
            stockLevel.currentStock - stockLevel.reservedStock;
          if (availableForReservation < quantity) {
            throw new BadRequestException(
              `Cannot reserve more than available stock. Available: ${availableForReservation}, Requested: ${quantity}`,
            );
          }
          stockLevel.reservedStock += quantity;
          break;

        case ReservedStockAction.DECREASE:
          // Ensure we don't decrease more than what's reserved
          if (stockLevel.reservedStock < quantity) {
            throw new BadRequestException(
              `Cannot unreserve more than what's reserved. Reserved: ${stockLevel.reservedStock}, Requested: ${quantity}`,
            );
          }
          stockLevel.reservedStock -= quantity;
          break;

        case ReservedStockAction.UNRESERVE_ALL:
          // Track the quantity being unreserved for transaction record
          const unreservedQuantity = stockLevel.reservedStock;
          stockLevel.reservedStock = 0;
          // Use this quantity for the transaction record
          if (unreservedQuantity > 0) {
            dto.quantity = unreservedQuantity;
          }
          break;

        default:
          throw new BadRequestException(`Unsupported action: ${action}`);
      }

      // Update available stock (will be clamped to 0 in pre-save hook if negative)
      stockLevel.availableStock = Math.max(
        0,
        stockLevel.currentStock - stockLevel.reservedStock,
      );

      // Save the changes
      await item.save();

      // Create a record of this reservation change if there was an actual change in quantity
      if (dto.quantity > 0) {
        let transactionType: TransactionType;
        let notes = dto.notes || `Reserved stock ${action} operation`;

        switch (action) {
          case ReservedStockAction.INCREASE:
            transactionType = TransactionType.ALLOCATION;
            break;
          case ReservedStockAction.DECREASE:
          case ReservedStockAction.UNRESERVE_ALL:
            transactionType = TransactionType.RETURN;
            break;
        }

        await this.transactionModel.create({
          inventoryItem: new Types.ObjectId(inventoryItem),
          transactionType,
          quantity: dto.quantity,
          fromLocation: new Types.ObjectId(location),
          performedBy: new Types.ObjectId(performedBy),
          notes,
        });
      }

      // Return the updated item with populated fields
      const updatedItem = await this.inventoryModel
        .findById(inventoryItem)
        .populate('stockLevels.location', 'name address city')
        .populate('supplier', 'name contactPerson')
        .lean();

      if (!updatedItem) {
        throw new NotFoundException('Item not found after update');
      }

      // Calculate stock stats
      const stats = await this.calculateStockStats(updatedItem);

      // Return the item with calculated stats
      const result = {
        ...updatedItem,
        _id: updatedItem._id.toString(),
        totalStock: stats.totalStock,
        totalReserved: stats.totalReserved,
        totalAvailable: stats.totalAvailable,
        stockStatus: updatedItem.stockStatus || StockStatus.IN_STOCK,
      };

      return {
        success: true,
        message: `Reserved stock updated successfully (${action})`,
        data: result,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Error updating reserved stock: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
