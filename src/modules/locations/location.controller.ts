import { Controller, Get, Post, Body, Param, Patch, Delete, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LocationService } from './location.service';
import { CreateLocationDto, UpdateLocationDto } from './location.dto';
import { Location } from './location.schema';

@ApiTags('Locations')
@ApiBearerAuth()
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new location/site', description: 'Add a new project site. Example: Nairobi North Site, county: Nairobi, address: 123 Solar Lane, coordinates: { lat: -1.2921, lng: 36.8219 }' })
  @ApiResponse({ status: 201, description: 'Location created', type: Location })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() createDto: CreateLocationDto): Promise<Location> {
    return await this.locationService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all locations/sites', description: 'Returns all solar project sites in Kenya.' })
  @ApiResponse({ status: 200, description: 'List of locations', type: [Location] })
  async findAll(): Promise<Location[]> {
    return await this.locationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get location/site by ID', description: 'Returns a specific site by MongoDB ObjectId. Example: 66500f0e8e5d7a001e8e4c10' })
  @ApiResponse({ status: 200, description: 'Location found', type: Location })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async findOne(@Param('id') id: string): Promise<Location> {
    return await this.locationService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update location/site by ID', description: 'Update details of a specific site.' })
  @ApiResponse({ status: 200, description: 'Location updated', type: Location })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateLocationDto): Promise<Location> {
    return await this.locationService.update(id, updateDto);
  }

  @Get('get/basic-info')
  @ApiOperation({ summary: 'Get basic location information', description: 'Returns name, siteId, and systemSiteId for all locations' })
  @ApiResponse({ status: 200, description: 'Basic location information', type: [Location] })
  async getBasicInfo(): Promise<Pick<Location, 'name' | 'siteId' | 'systemSiteId'>[]> {
    return await this.locationService.getBasicInfo();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete location/site by ID', description: 'Delete a site by MongoDB ObjectId.' })
  @ApiResponse({ status: 204, description: 'Location deleted' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.locationService.remove(id);
  }
}
