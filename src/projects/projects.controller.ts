import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Roles } from '../role.decorator';
import { UserRole } from '../role.enum';
import { CreateProjectDto } from './dto/createProject.dto';
import { AuthGuard } from '../auth.guard';
import { RolesGuard } from '../role.guard';
import { Request } from 'express';
import { Project } from './entities/project.entity';
import { ProjectUsersService } from '../project-users/project-users.service';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly projectUsersService: ProjectUsersService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([UserRole.Admin])
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Req() req: Request) {
    const user = req.user as { id: string; role: string };
    if (user.role !== UserRole.Employee) {
      return this.projectsService.findAll();
    }
    return this.projectsService.findAllIfEmp(user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(
    @Param('id') projectId: string,
    @Req() req: Request,
  ): Promise<Project> {
    const user = req.user as { id: string; role: string };
    await this.projectsService.projectExist(projectId);

    if (user.role === UserRole.Employee) {
      await this.projectUsersService.userInProject(projectId, user.id);
      return this.projectsService.projectByUser(user.id, projectId);
    }
    return this.projectsService.findProjectAdmin(projectId);
  }
}
