import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Location, LocationSchema } from './location.schema';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Location.name, schema: LocationSchema }])],
  providers: [LocationService],
  controllers: [LocationController],
  exports: [LocationService],
})
export class LocationsModule {}
