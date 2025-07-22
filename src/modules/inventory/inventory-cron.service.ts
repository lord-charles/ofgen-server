import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InventoryItem, StockStatus } from './inventory.schema';

@Injectable()
export class InventoryCronService {
  private readonly logger = new Logger(InventoryCronService.name);

  constructor(
    @InjectModel(InventoryItem.name)
    private inventoryModel: Model<InventoryItem>,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleStockStatusAlignment() {
    this.logger.log('Running cron job to align inventory stock statuses...');

    const items = await this.inventoryModel
      .find()
      .select('stockLevels stockStatus')
      .exec();
    let updatedCount = 0;

    for (const item of items) {
      const totalStock =
        item.stockLevels?.reduce(
          (total, level) => total + level.currentStock,
          0,
        ) || 0;

      const minLevel = Math.min(
        ...(item.stockLevels?.map((level) => level.minimumLevel) || [0]),
      );

      let newStatus: StockStatus;

      if (totalStock === 0) {
        newStatus = StockStatus.OUT_OF_STOCK;
      } else if (totalStock <= minLevel) {
        newStatus = StockStatus.LOW_STOCK;
      } else {
        newStatus = StockStatus.IN_STOCK;
      }

      if (item.stockStatus !== newStatus) {
        item.stockStatus = newStatus;
        await item.save();
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      this.logger.log(`Aligned stock status for ${updatedCount} items.`);
    } else {
      this.logger.log('All inventory stock statuses are already aligned.');
    }
  }
}
