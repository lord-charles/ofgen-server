import { Controller, Get, Post, Body, Param, Patch, Delete, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';
import { Project } from './project.schema';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new project', description: 'Add a new solar project. Example: Nairobi Solar Project Alpha, location: 66500f0e8e5d7a001e8e4c10, county: Nairobi, capacity: 5.50 kW, status: In Progress, etc.' })
  @ApiResponse({ status: 201, description: 'Project created', type: Project })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() createDto: CreateProjectDto): Promise<Project> {
    try {
      return await this.projectService.create(createDto);
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to create project');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects', description: 'Returns all solar projects in Kenya.' })
  @ApiResponse({ status: 200, description: 'List of projects', type: [Project] })
  async findAll(): Promise<Project[]> {
    try {
      return await this.projectService.findAll();
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to fetch projects');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID', description: 'Returns a specific project by MongoDB ObjectId. Example: 66500f0e8e5d7a001e8e4b01' })
  @ApiResponse({ status: 200, description: 'Project found', type: Project })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async findOne(@Param('id') id: string): Promise<Project> {
    try {
      return await this.projectService.findOne(id);
    } catch (error) {
      if (error.status === 404) throw error;
      throw new BadRequestException(error.message || 'Failed to fetch project');
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project by ID', description: 'Update details of a specific project.' })
  @ApiResponse({ status: 200, description: 'Project updated', type: Project })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateProjectDto): Promise<Project> {
    try {
      return await this.projectService.update(id, updateDto);
    } catch (error) {
      if (error.status === 404) throw error;
      throw new BadRequestException(error.message || 'Failed to update project');
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project by ID', description: 'Delete a project by MongoDB ObjectId.' })
  @ApiResponse({ status: 204, description: 'Project deleted' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.projectService.remove(id);
    } catch (error) {
      if (error.status === 404) throw error;
      throw new BadRequestException(error.message || 'Failed to delete project');
    }
  }
}
