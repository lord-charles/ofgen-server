import { Controller, Get, Post, Body, Param, Patch, Delete, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SubcontractorService } from './subcontractor.service';
import { ProjectService } from './project.service';
import { CreateSubcontractorDto, UpdateSubcontractorDto, SubcontractorDto, SubcontractorContactDto } from './project.dto';
import { Subcontractor } from './project.schema';

@ApiTags('Subcontractors')
@ApiBearerAuth()
@Controller('subcontractors')
export class SubcontractorController {
  constructor(
    private readonly subcontractorService: SubcontractorService,
    private readonly projectService: ProjectService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new subcontractor',
    description: 'Register a new subcontractor in the system. Can be either a company or an individual.'
  })
  @ApiResponse({ status: 201, description: 'Subcontractor successfully created', type: SubcontractorDto })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  async create(@Body() createDto: CreateSubcontractorDto): Promise<Subcontractor> {
    try {
      return await this.subcontractorService.create(createDto);
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to create subcontractor');
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get all subcontractors',
    description: 'Returns all subcontractors in the system with optional filtering by active status and type.'
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status'
  })
  @ApiQuery({
    name: 'isCompany',
    required: false,
    type: Boolean,
    description: 'Filter by subcontractor type (company or individual)'
  })
  @ApiResponse({ status: 200, description: 'List of subcontractors retrieved successfully', type: [SubcontractorDto] })
  async findAll(
    @Query('isActive') isActive?: boolean,
    @Query('isCompany') isCompany?: boolean
  ): Promise<Subcontractor[]> {
    try {
      return await this.subcontractorService.findAll(isActive, isCompany);
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to fetch subcontractors');
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get subcontractor by ID',
    description: 'Returns detailed information about a specific subcontractor.'
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the subcontractor',
    example: '6450ab3c2c4e1a8f9c8b4567'
  })
  @ApiResponse({ status: 200, description: 'Subcontractor found and retrieved successfully', type: SubcontractorDto })
  @ApiResponse({ status: 404, description: 'Subcontractor not found - Invalid ID or subcontractor does not exist' })
  async findOne(@Param('id') id: string): Promise<Subcontractor> {
    try {
      return await this.subcontractorService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message || 'Failed to fetch subcontractor');
    }
  }

  @Get('get/basic-info')
  @ApiOperation({
    summary: 'Get all subcontractor contact information',
    description: 'Returns basic contact information for all subcontractors. For companies, returns company name, email, and phone. For individuals, returns names, email, and phone.'
  })
  @ApiResponse({ status: 200, description: 'Contact information retrieved successfully', type: SubcontractorContactDto })
  @ApiResponse({ status: 404, description: 'Subcontractor not found - Invalid ID or subcontractor does not exist' })
  async getContactInfo() {
    try {
      return await this.subcontractorService.getContactInfo();
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message || 'Failed to fetch subcontractor contact information');
    }
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update subcontractor by ID',
    description: 'Update details of a specific subcontractor.'
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the subcontractor to update',
    example: '6450ab3c2c4e1a8f9c8b4567'
  })
  @ApiResponse({ status: 200, description: 'Subcontractor successfully updated', type: SubcontractorDto })
  @ApiResponse({ status: 404, description: 'Subcontractor not found - Invalid ID or subcontractor does not exist' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid update data' })
  async update(
    @Param('id') id: string, 
    @Body() updateDto: UpdateSubcontractorDto
  ): Promise<Subcontractor> {
    try {
      return await this.subcontractorService.update(id, updateDto);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message || 'Failed to update subcontractor');
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete subcontractor by ID',
    description: 'Permanently removes a subcontractor from the system.'
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the subcontractor to delete',
    example: '6450ab3c2c4e1a8f9c8b4567'
  })
  @ApiResponse({ status: 204, description: 'Subcontractor successfully deleted' })
  @ApiResponse({ status: 404, description: 'Subcontractor not found - Invalid ID or subcontractor does not exist' })
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.subcontractorService.remove(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message || 'Failed to delete subcontractor');
    }
  }

  @Post('projects/:projectId/subcontractors/:subcontractorId')
  @ApiOperation({
    summary: 'Add subcontractor to project',
    description: 'Assigns a subcontractor to a specific project.'
  })
  @ApiParam({
    name: 'projectId',
    description: 'MongoDB ObjectId of the project',
    example: '6450ab3c2c4e1a8f9c8b4570'
  })
  @ApiParam({
    name: 'subcontractorId',
    description: 'MongoDB ObjectId of the subcontractor to add',
    example: '6450ab3c2c4e1a8f9c8b4567'
  })
  @ApiResponse({ status: 204, description: 'Subcontractor successfully added to project' })
  @ApiResponse({ status: 404, description: 'Project or subcontractor not found' })
  async addToProject(
    @Param('projectId') projectId: string,
    @Param('subcontractorId') subcontractorId: string
  ): Promise<void> {
    try {
      // Validate subcontractor exists
      await this.subcontractorService.findOne(subcontractorId);
      
      // Add to project
      await this.projectService.addSubcontractor(projectId, subcontractorId);

    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message || 'Failed to add subcontractor to project');
    }
  }

  @Delete('projects/:projectId/subcontractors/:subcontractorId')
  @ApiOperation({
    summary: 'Remove subcontractor from project',
    description: 'Removes a subcontractor from a specific project.'
  })
  @ApiParam({
    name: 'projectId',
    description: 'MongoDB ObjectId of the project',
    example: '6450ab3c2c4e1a8f9c8b4570'
  })
  @ApiParam({
    name: 'subcontractorId',
    description: 'MongoDB ObjectId of the subcontractor to remove',
    example: '6450ab3c2c4e1a8f9c8b4567'
  })
  @ApiResponse({ status: 204, description: 'Subcontractor successfully removed from project' })
  @ApiResponse({ status: 404, description: 'Project or subcontractor not found' })
  async removeFromProject(
    @Param('projectId') projectId: string,
    @Param('subcontractorId') subcontractorId: string
  ): Promise<void> {
    try {
      // Validate subcontractor exists
      await this.subcontractorService.findOne(subcontractorId);
      
      // Remove from project
      await this.projectService.removeSubcontractor(projectId, subcontractorId);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message || 'Failed to remove subcontractor from project');
    }
  }
}
