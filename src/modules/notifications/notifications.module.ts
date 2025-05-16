import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './services/notification.service';

@Module({
  imports: [ConfigModule], // Added ConfigModule
  providers: [NotificationService],
  exports: [NotificationService],
  // Removed empty controllers array as it's not needed
})
export class NotificationsModule {}

