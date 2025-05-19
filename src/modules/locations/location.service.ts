import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Location, LocationDocument } from './location.schema';
import { CreateLocationDto, UpdateLocationDto } from './location.dto';

@Injectable()
export class LocationService {
  constructor(
    @InjectModel(Location.name) private locationModel: Model<LocationDocument>,
  ) {}

  async create(createDto: CreateLocationDto): Promise<Location> {
    const created = new this.locationModel(createDto);
    return created.save();
  }

  async findAll(): Promise<Location[]> {
    return this.locationModel.find().exec();
  }

  async findOne(id: string): Promise<Location> {
    const location = await this.locationModel.findById(id).exec();
    if (!location) throw new NotFoundException('Location not found');
    return location;
  }

  async update(id: string, updateDto: UpdateLocationDto): Promise<Location> {
    const updated = await this.locationModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    if (!updated) throw new NotFoundException('Location not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.locationModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Location not found');
  }
}
