import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './project.schema';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async create(createDto: CreateProjectDto): Promise<Project> {
    const created = new this.projectModel({
      ...createDto,
      location: new Types.ObjectId(createDto.location),
      users: (createDto.users || []).map((id) => new Types.ObjectId(id)),
    });
    return created.save();
  }

  async findAll(): Promise<Project[]> {
    return this.projectModel.find().populate('location').populate('users').exec();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectModel.findById(id).populate('location').populate('users').exec();
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, updateDto: UpdateProjectDto): Promise<Project> {
    const updateData: any = {
      ...updateDto,
    };
    if (updateDto.location) updateData.location = new Types.ObjectId(updateDto.location);
    if (updateDto.users) updateData.users = updateDto.users.map((id) => new Types.ObjectId(id));
    const updated = await this.projectModel.findByIdAndUpdate(id, updateData, { new: true })
      .populate('location')
      .populate('users')
      .exec();
    if (!updated) throw new NotFoundException('Project not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.projectModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Project not found');
  }
}
