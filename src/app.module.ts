import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { ScheduleModule } from '@nestjs/schedule';
import { SystemLogsModule } from './modules/system-logs/system-logs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { LocationsModule } from './modules/locations/locations.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ServiceOrderModule } from './modules/service-order/service-order.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { InventoryModule } from './modules/inventory/inventory.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    DatabaseModule,
    SystemLogsModule,
    NotificationsModule,
    LocationsModule,
    ProjectsModule,
    ServiceOrderModule,
    DashboardModule,
    InventoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
