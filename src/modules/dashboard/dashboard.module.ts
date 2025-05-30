import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from '../projects/project.schema';
import { Location, LocationSchema } from '../locations/location.schema';
import {
  ServiceOrder,
  ServiceOrderSchema,
} from '../service-order/service-order.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { Subcontractor, SubcontractorSchema } from '../projects/project.schema';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Location.name, schema: LocationSchema },
      { name: ServiceOrder.name, schema: ServiceOrderSchema },
      { name: User.name, schema: UserSchema },
      { name: Subcontractor.name, schema: SubcontractorSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
