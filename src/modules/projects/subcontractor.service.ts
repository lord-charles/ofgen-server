import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subcontractor, SubcontractorDocument } from './project.schema';
import { CreateSubcontractorDto, UpdateSubcontractorDto, SubcontractorContactDto } from './project.dto';

@Injectable()
export class SubcontractorService {
  constructor(
    @InjectModel(Subcontractor.name) private subcontractorModel: Model<SubcontractorDocument>,
  ) {}

  
  async create(createDto: CreateSubcontractorDto): Promise<Subcontractor> {
    this.validateSubcontractorData(createDto);

    const created = new this.subcontractorModel(createDto);
    return created.save();
  }


  async findAll(isActive?: boolean, isCompany?: boolean): Promise<Subcontractor[]> {
    const filter: any = {};
    
    if (isActive !== undefined) filter.isActive = isActive;
    if (isCompany !== undefined) filter.isCompany = isCompany;
    
    return this.subcontractorModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Subcontractor> {
    try {
      const subcontractor = await this.subcontractorModel.findById(id).exec();
      if (!subcontractor) throw new NotFoundException(`Subcontractor with ID ${id} not found`);
      return subcontractor;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException('Invalid subcontractor ID format');
      }
      throw error;
    }
  }

  async getContactInfo() {
    const subcontractorDoc = await this.subcontractorModel.find().exec()
    
    const subcontractorObj = subcontractorDoc.map((subcontractor) => subcontractor.toObject());
    
    const contactInfo: SubcontractorContactDto[] = subcontractorObj.map((subcontractorObj) => {
      const contactInfo: SubcontractorContactDto = {
      _id: subcontractorObj._id.toString(),
      isCompany: subcontractorObj.isCompany,
      email: subcontractorObj.email,
      phone: subcontractorObj.phone,
      companyName: subcontractorObj?.companyName ||"",
      firstName: subcontractorObj?.firstName ||"",
      lastName: subcontractorObj?.lastName ||"",
    };

    
    return contactInfo;
    });
    
    return contactInfo;
  }

  async update(id: string, updateDto: UpdateSubcontractorDto): Promise<Subcontractor> {
    if (updateDto.isCompany !== undefined) {
      this.validateSubcontractorData(updateDto);
    }
    
    try {
      const updated = await this.subcontractorModel.findByIdAndUpdate(
        id, 
        updateDto,
        { new: true, runValidators: true }
      ).exec();
      
      if (!updated) throw new NotFoundException(`Subcontractor with ID ${id} not found`);
      return updated;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException('Invalid subcontractor ID format');
      }
      throw error;
    }
  }

 
  async remove(id: string): Promise<{message: string}> {
    try {
      const result = await this.subcontractorModel.findByIdAndDelete(id).exec();
      if (!result) throw new NotFoundException(`Subcontractor with ID ${id} not found`);
      return {message: 'Subcontractor deleted successfully'}
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException('Invalid subcontractor ID format');
      }
      throw error;
    }
  }

 
  async addToProject(projectId: string, subcontractorId: string): Promise<{message: string}> {
    await this.findOne(subcontractorId);
    const ProjectModel = this.subcontractorModel.db.model('Project');
    const project = await ProjectModel.findById(projectId);
    if (!project) throw new NotFoundException(`Project with ID ${projectId} not found`);
    if (project.subcontractors && project.subcontractors.some((id: any) => id.equals(subcontractorId))) {
      throw new BadRequestException('Subcontractor is already assigned to this project');
    }
    project.subcontractors.push(new Types.ObjectId(subcontractorId));
    await project.save();
    return {message: 'Subcontractor added to project successfully'}
  }

 
  async removeFromProject(projectId: string, subcontractorId: string): Promise<{message: string}> {
    await this.findOne(subcontractorId);
    const ProjectModel = this.subcontractorModel.db.model('Project');
    const project = await ProjectModel.findById(projectId);
    if (!project) throw new NotFoundException(`Project with ID ${projectId} not found`);
    project.subcontractors = (project.subcontractors || []).filter((id: any) => !id.equals(subcontractorId));
    await project.save();
    return {message: 'Subcontractor removed from project successfully'}
  }

  private validateSubcontractorData(data: CreateSubcontractorDto | UpdateSubcontractorDto): void {
    if (data.isCompany) {
      if (!data.companyName) {
        throw new BadRequestException('Company name is required for company subcontractors');
      }
    } else {
      if (!data.firstName || !data.lastName) {
        throw new BadRequestException('First name and last name are required for individual subcontractors');
      }
    }
  }
}
