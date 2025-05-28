import { Controller, Get, Post, Body, Param, Patch, Delete, BadRequestException, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';
import { Project, ProjectStatus } from './project.schema';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }

  @Post()
  @ApiOperation({
    summary: 'Create a new project',
    description: 'Add a new telecom infrastructure project. Example: Kitengela Solar Power Installation for Safaricom, with specified location, capacity, timeline, and team structure.'
  })
  @ApiResponse({ status: 201, description: 'Project successfully created', type: Project })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  async create(@Body() createDto: CreateProjectDto): Promise<Project> {
    try {
      return await this.projectService.create(createDto);
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to create project');
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get all projects',
    description: 'Returns all telecom infrastructure projects managed by Ofgen across Kenya.'
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ProjectStatus,
    description: 'Filter projects by status'
  })
  @ApiResponse({ status: 200, description: 'List of projects retrieved successfully', type: [Project] })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid query parameters' })
  async findAll(@Query('status') status?: ProjectStatus): Promise<Project[]> {
    try {
      return await this.projectService.findAll(status);
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to fetch projects');
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get project by ID',
    description: 'Returns detailed information about a specific project including milestones, tasks, risks, and team structure.'
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the project',
    example: '6450ab3c2c4e1a8f9c8b4571'
  })
  @ApiResponse({ status: 200, description: 'Project found and retrieved successfully', type: Project })
  @ApiResponse({ status: 404, description: 'Project not found - Invalid ID or project does not exist' })
  async findOne(@Param('id') id: string): Promise<Project> {
    try {
      return await this.projectService.findOne(id);
    } catch (error) {
      if (error.status === 404) throw error;
      throw new BadRequestException(error.message || 'Failed to fetch project');
    }
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update project by ID',
    description: 'Update details of a specific project including status, progress, milestones, tasks, and team assignments.'
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the project to update',
    example: '6450ab3c2c4e1a8f9c8b4571'
  })
  @ApiResponse({ status: 200, description: 'Project successfully updated', type: Project })
  @ApiResponse({ status: 404, description: 'Project not found - Invalid ID or project does not exist' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid update data' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateProjectDto): Promise<Project> {
    try {
      return await this.projectService.update(id, updateDto);
    } catch (error) {
      if (error.status === 404) throw error;
      throw new BadRequestException(error.message || 'Failed to update project');
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete project by ID',
    description: 'Permanently removes a project and all associated data from the system.'
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the project to delete',
    example: '6450ab3c2c4e1a8f9c8b4571'
  })
  @ApiResponse({ status: 204, description: 'Project successfully deleted' })
  @ApiResponse({ status: 404, description: 'Project not found - Invalid ID or project does not exist' })
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.projectService.remove(id);
    } catch (error) {
      if (error.status === 404) throw error;
      throw new BadRequestException(error.message || 'Failed to delete project');
    }
  }
}
