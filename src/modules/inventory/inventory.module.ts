import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import {
  InventoryItem,
  InventoryItemSchema,
  InventoryTransaction,
  InventoryTransactionSchema,
  Supplier,
  SupplierSchema,
  StockLocation,
  StockLocationSchema,
} from './inventory.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InventoryItem.name, schema: InventoryItemSchema },
      { name: InventoryTransaction.name, schema: InventoryTransactionSchema },
      { name: Supplier.name, schema: SupplierSchema },
      { name: StockLocation.name, schema: StockLocationSchema },
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
