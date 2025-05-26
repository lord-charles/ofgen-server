import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiceOrderController } from './service-order.controller';
import { ServiceOrder, ServiceOrderSchema } from './service-order.schema';
import { ServiceOrderService } from './service-order.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServiceOrder.name, schema: ServiceOrderSchema },
    ]),
  ],
  controllers: [ServiceOrderController],
  providers: [ServiceOrderService],
  exports: [ServiceOrderService],
})
export class ServiceOrderModule { }

