import {
  ConflictException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProjectUserDto } from './dto/createProjectUser.dto';
import { ProjectUser } from './entities/project-user.entity';
import { ProjectsService } from '../projects/projects.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProjectUsersService {
  constructor(
    @InjectRepository(ProjectUser)
    private readonly ProjectUsersRepository: Repository<ProjectUser>,
    @Inject(forwardRef(() => ProjectsService))
    private readonly projectsService: ProjectsService,
    private readonly usersService: UsersService,
  ) {}

  async create(createProjectUserDto: CreateProjectUserDto) {
    const newProjectUser = this.ProjectUsersRepository.create({
      ...createProjectUserDto,
    });
    await this.projectsService.projectExist(newProjectUser.projectId);
    if ((await this.usersService.findOne(newProjectUser.userId)) == null) {
      throw new NotFoundException();
    }
    const existingProjectsUser = await this.findAllById(newProjectUser.userId);
    if (existingProjectsUser != null) {
      if (
        existingProjectsUser.some(
          (projectUser: ProjectUser) =>
            new Date(newProjectUser.startDate) <
              new Date(projectUser.endDate) ||
            new Date(newProjectUser.endDate) < new Date(projectUser.endDate),
        )
      ) {
        throw new ConflictException();
      }
    }
    const inserted = await this.ProjectUsersRepository.save(newProjectUser);
    return this.ProjectUsersRepository.findOne({
      where: {
        id: inserted.id,
      },
      relations: {
        project: { referringEmployee: true },
        user: true,
      },
    });
  }

  async findAllById(id: string): Promise<ProjectUser[] | null> {
    return this.ProjectUsersRepository.find({
      where: { userId: id },
    });
  }

  async findAll(user: { id: string; role: string }): Promise<ProjectUser[]> {
    if (user.role === 'Employee') {
      return this.ProjectUsersRepository.find({
        where: { userId: user.id },
      });
    }
    return this.ProjectUsersRepository.find();
  }

  async getProjectUser(
    user: { id: string; role: string },
    projectId: string,
  ): Promise<ProjectUser> {
    if (user.role === 'Employee') {
      return this.ProjectUsersRepository.findOne({
        where: { userId: user.id, id: projectId },
      });
    }
    return this.ProjectUsersRepository.findOne({
      where: {
        id: projectId,
      },
    });
  }
  async getProjectIdsByUser(userId: string): Promise<string[]> {
    const projectUsers = await this.ProjectUsersRepository.find({
      select: ['projectId'],
      where: { userId: userId },
    });
    return projectUsers.map((projectUser) => projectUser.projectId);
  }

  async userInProject(projectId: string, userId: string) {
    try {
      await this.ProjectUsersRepository.findOneOrFail({
        where: { projectId: projectId, userId: userId },
      });
    } catch {
      throw new ForbiddenException();
    }
  }
}
