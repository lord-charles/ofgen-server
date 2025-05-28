import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument, Subcontractor, SubcontractorDocument, ProjectStatus } from './project.schema';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Subcontractor.name) private subcontractorModel: Model<SubcontractorDocument>,
  ) {}

  async create(createDto: CreateProjectDto): Promise<Project> {
    // Convert string dates to Date objects and handle ObjectIds
    const projectData: any = {
      ...createDto,
      location: new Types.ObjectId(createDto.location),
      serviceOrder: new Types.ObjectId(createDto.serviceOrder),
    };

    // Handle optional ObjectId fields
    if (createDto.projectLeader) {
      projectData.projectLeader = new Types.ObjectId(createDto.projectLeader);
    }

    // Handle arrays of ObjectIds
    if (createDto.subcontractors && createDto.subcontractors.length > 0) {
      projectData.subcontractors = createDto.subcontractors.map(id => new Types.ObjectId(id));
    }

    // Handle date conversions
    ['plannedStartDate', 'targetCompletionDate', 'actualStartDate', 'actualCompletionDate'].forEach(field => {
      if (createDto[field]) {
        projectData[field] = new Date(createDto[field]);
      }
    });

    // Process nested objects like milestones, risks, etc.
    this.processNestedObjects(projectData);

    const created = new this.projectModel(projectData);
    return created.save();
  }

  async findAll(status?: ProjectStatus): Promise<Project[]> {
    const filter = status ? { status } : {};
    
    return this.projectModel.find(filter)
      .populate('location')
      .populate('serviceOrder')
      .populate('projectLeader')
      .populate('subcontractors')
      .exec();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectModel.findById(id)
      .populate('location')
      .populate('serviceOrder')
      .populate('projectLeader')
      .populate('subcontractors')
      .exec();
    
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, updateDto: UpdateProjectDto): Promise<Project> {
    // Convert string dates to Date objects and handle ObjectIds
    const updateData: any = { ...updateDto };
    
    // Handle ObjectIds
    if (updateDto.location) updateData.location = new Types.ObjectId(updateDto.location);
    if (updateDto.serviceOrder) updateData.serviceOrder = new Types.ObjectId(updateDto.serviceOrder);
    if (updateDto.projectLeader) updateData.projectLeader = new Types.ObjectId(updateDto.projectLeader);
    
    // Handle arrays of ObjectIds
    if (updateDto.subcontractors && updateDto.subcontractors.length > 0) {
      updateData.subcontractors = updateDto.subcontractors.map(id => new Types.ObjectId(id));
    }

    // Handle date conversions
    ['plannedStartDate', 'targetCompletionDate', 'actualStartDate', 'actualCompletionDate'].forEach(field => {
      if (updateDto[field]) {
        updateData[field] = new Date(updateDto[field]);
      }
    });

    // Process nested objects like milestones, risks, etc.
    this.processNestedObjects(updateData);

    const updated = await this.projectModel.findByIdAndUpdate(id, updateData, { new: true })
      .populate('location')
      .populate('serviceOrder')
      .populate('projectLeader')
      .populate('subcontractors')
      .exec();
      
    if (!updated) throw new NotFoundException('Project not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.projectModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Project not found');
  }

  /**
   * Add a subcontractor to a project
   */
  async addSubcontractor(projectId: string, subcontractorId: string): Promise<Project> {
    try {
      // Validate project exists
      const project = await this.findOne(projectId);
      
      // Convert to ObjectId
      const subId = new Types.ObjectId(subcontractorId);
      
      // Check if subcontractor is already in the project
      if (project.subcontractors && project.subcontractors.some(id => id.equals(subId))) {
        throw new BadRequestException('Subcontractor is already assigned to this project');
      }
      
      // Add subcontractor to project
      const updated = await this.projectModel.findByIdAndUpdate(
        projectId,
        { $addToSet: { subcontractors: subId } },
        { new: true }
      )
        .populate('location')
        .populate('serviceOrder')
        .populate('projectLeader')
        .populate('subcontractors')
        .exec();
      
      if (!updated) throw new NotFoundException(`Project with ID ${projectId} not found`);
      return updated;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException('Invalid ID format');
      }
      throw error;
    }
  }

  /**
   * Remove a subcontractor from a project
   */
  async removeSubcontractor(projectId: string, subcontractorId: string): Promise<Project> {
    try {
      // Validate project exists
      await this.findOne(projectId);
      
      // Convert to ObjectId
      const subId = new Types.ObjectId(subcontractorId);
      
      // Remove subcontractor from project
      const updated = await this.projectModel.findByIdAndUpdate(
        projectId,
        { $pull: { subcontractors: subId } },
        { new: true }
      )
        .populate('location')
        .populate('serviceOrder')
        .populate('projectLeader')
        .populate('subcontractors')
        .exec();
      
      if (!updated) throw new NotFoundException(`Project with ID ${projectId} not found`);
      return updated;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException('Invalid ID format');
      }
      throw error;
    }
  }

  /**
   * Get all projects for a specific subcontractor
   */
  async getProjectsBySubcontractor(subcontractorId: string): Promise<Project[]> {
    try {
      const subId = new Types.ObjectId(subcontractorId);
      
      return this.projectModel.find({ subcontractors: subId })
        .populate('location')
        .populate('serviceOrder')
        .populate('projectLeader')
        .populate('subcontractors')
        .exec();
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException('Invalid subcontractor ID format');
      }
      throw error;
    }
  }

  // Process nested objects in project data to handle date conversions and ObjectIds
  private processNestedObjects(data: any): void {
    // Process milestones
    if (data.milestones && data.milestones.length > 0) {
      data.milestones = data.milestones.map(milestone => {
        const processedMilestone = { ...milestone };
        
        // Convert date strings to Date objects
        if (milestone.dueDate) processedMilestone.dueDate = new Date(milestone.dueDate);
        if (milestone.completedDate) processedMilestone.completedDate = new Date(milestone.completedDate);
        
        // Process tasks within milestones
        if (milestone.tasks && milestone.tasks.length > 0) {
          processedMilestone.tasks = milestone.tasks.map(task => {
            const processedTask = { ...task };
            
            // Convert date strings to Date objects
            ['plannedStartDate', 'plannedEndDate', 'actualStartDate', 'actualEndDate'].forEach(field => {
              if (task[field]) processedTask[field] = new Date(task[field]);
            });
            
            // Convert subcontractor ID to ObjectId if present
            if (task.assignedSubcontractor) {
              processedTask.assignedSubcontractor = new Types.ObjectId(task.assignedSubcontractor);
            }
            
            return processedTask;
          });
        }
        
        return processedMilestone;
      });
    }
    
    // Process risks
    if (data.risks && data.risks.length > 0) {
      data.risks = data.risks.map(risk => {
        const processedRisk = { ...risk };
        
        // Convert date strings to Date objects
        if (risk.identifiedDate) processedRisk.identifiedDate = new Date(risk.identifiedDate);
        if (risk.targetResolutionDate) processedRisk.targetResolutionDate = new Date(risk.targetResolutionDate);
        
        // Convert owner ID to ObjectId if present
        if (risk.owner) {
          processedRisk.owner = new Types.ObjectId(risk.owner);
        }
        
        return processedRisk;
      });
    }
  }
}
