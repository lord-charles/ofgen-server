import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './project.schema';

@Injectable()
export class ProjectSyncService {
  private readonly logger = new Logger(ProjectSyncService.name);

  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  // Runs every hour
  @Cron(CronExpression.EVERY_10_MINUTES)
  async syncProjectProgressWithMilestones() {
    this.logger.log('Starting project progress sync job...');
    const projects = await this.projectModel
      .find({}, { milestones: 1, progress: 1 })
      .exec();
    for (const project of projects) {
      if (!Array.isArray(project.milestones) || project.milestones.length === 0)
        continue;
      const validMilestones = project.milestones.filter(
        (m: any) => typeof m.progress === 'number' && !isNaN(m.progress),
      );
      if (validMilestones.length === 0) continue;
      const total = validMilestones.reduce(
        (sum: number, m: any) => sum + (m.progress ?? 0),
        0,
      );
      const average = total / validMilestones.length;
      const rounded = Math.round(average);
      if (project.progress !== rounded) {
        await this.projectModel.updateOne(
          { _id: project._id },
          { $set: { progress: rounded } },
        );
        this.logger.log(
          `Updated project ${project._id} progress to ${rounded}%`,
        );
      }
    }
    this.logger.log('Project progress sync job completed.');
  }
}
