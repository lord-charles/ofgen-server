import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Location, LocationDocument } from './location.schema';
import { CreateLocationDto, UpdateLocationDto } from './location.dto';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  constructor(
    @InjectModel(Location.name) private locationModel: Model<LocationDocument>,
  ) { }

  async create(createDto: CreateLocationDto): Promise<Location> {
    try {
      if (createDto.siteId) {
        const exists = await this.locationModel.findOne({ siteId: createDto.siteId });
        if (exists) throw new BadRequestException('siteId already exists');
      }
      const created = new this.locationModel(createDto);
      return await created.save();
    } catch (error) {
      this.logger.error('Error creating location', error.stack || error.message);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(error.message || 'Failed to create location');
    }
  }

  async findAll(): Promise<Location[]> {
    try {
      return await this.locationModel.find().exec();
    } catch (error) {
      this.logger.error('Error fetching locations', error.stack || error.message);
      throw new BadRequestException(error.message || 'Failed to fetch locations');
    }
  }

  async findOne(id: string): Promise<Location> {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid location ID');
    try {
      const location = await this.locationModel.findById(id).exec();
      if (!location) throw new NotFoundException('Location not found');
      return location;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error('Error fetching location', error.stack || error.message);
      throw new BadRequestException(error.message || 'Failed to fetch location');
    }
  }

  async update(id: string, updateDto: UpdateLocationDto): Promise<Location> {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid location ID');
    if ((updateDto as any).systemSiteId) {
      throw new BadRequestException('systemSiteId cannot be updated');
    }
    if (updateDto.siteId) {
      const exists = await this.locationModel.findOne({ siteId: updateDto.siteId, _id: { $ne: id } });
      if (exists) throw new BadRequestException('siteId already exists');
    }
    try {
      const updated = await this.locationModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
      if (!updated) throw new NotFoundException('Location not found');
      return updated;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error('Error updating location', error.stack || error.message);
      throw new BadRequestException(error.message || 'Failed to update location');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid location ID');
    try {
      const result = await this.locationModel.findByIdAndDelete(id).exec();
      if (!result) throw new NotFoundException('Location not found');
      return { message: 'Location deleted successfully' }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error('Error deleting location', error.stack || error.message);
      throw new BadRequestException(error.message || 'Failed to delete location');
    }
  }
}

