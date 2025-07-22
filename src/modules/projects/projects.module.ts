import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Project,
  ProjectSchema,
  Subcontractor,
  SubcontractorSchema,
  MilestoneSchema,
  TaskSchema,
  RiskItemSchema,
  Task,
  Milestone,
  RiskItem,
} from './project.schema';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { SubcontractorService } from './subcontractor.service';
import { SubcontractorController } from './subcontractor.controller';
import { LocationsModule } from '../locations/locations.module';
import { ProjectSyncService } from './project-sync.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Subcontractor.name, schema: SubcontractorSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Milestone.name, schema: MilestoneSchema },
      { name: RiskItem.name, schema: RiskItemSchema },
    ]),
    LocationsModule,
  ],
  providers: [ProjectService, SubcontractorService, ProjectSyncService],
  controllers: [ProjectController, SubcontractorController],
  exports: [ProjectService, SubcontractorService],
})
export class ProjectsModule {}
