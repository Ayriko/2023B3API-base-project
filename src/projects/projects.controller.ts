import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Roles } from '../role.decorator';
import { UserRole } from '../role.enum';
import { CreateProjectDto } from './dto/createProject.dto';
import { AuthGuard } from '../auth.guard';
import { RolesGuard } from '../role.guard';
import { Request } from 'express';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

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
    return this.projectsService.findAll(user);
  }
}
