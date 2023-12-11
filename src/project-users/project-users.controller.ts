import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProjectUsersService } from './project-users.service';
import { Roles } from '../role.decorator';
import { UserRole } from '../role.enum';
import { CreateProjectUserDto } from './dto/createProjectUser.dto';
import { AuthGuard } from '../auth.guard';
import { RolesGuard } from '../role.guard';
import { Request } from 'express';

@Controller('project-users')
export class ProjectUsersController {
  constructor(private readonly projectUsersService: ProjectUsersService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([UserRole.Admin, UserRole.ProjectManager])
  create(@Body() createProjectUserDto: CreateProjectUserDto) {
    return this.projectUsersService.create(createProjectUserDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Req() req: Request) {
    const user = req.user as { id: string; role: string };
    return this.projectUsersService.findAll(user);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const user = req.user as { id: string; role: string };
    return this.projectUsersService.getProjectUser(user, id);
  }
}
