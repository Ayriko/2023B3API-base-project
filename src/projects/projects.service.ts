import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/createProject.dto';
import { UsersService } from '../users/users.service';
import { ProjectUsersService } from '../project-users/project-users.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly ProjectsRepository: Repository<Project>,
    private readonly usersService: UsersService,
    private readonly projectUsersService: ProjectUsersService,
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    const newProject = this.ProjectsRepository.create({
      ...createProjectDto,
    });
    const referringUser = await this.usersService.findOne(
      newProject.referringEmployeeId,
    );
    if (referringUser.role === 'Employee') {
      throw new UnauthorizedException();
    }
    const inserted = await this.ProjectsRepository.save(newProject);
    return this.ProjectsRepository.findOne({
      where: {
        id: inserted.id,
      },
      relations: ['referringEmployee'],
    });
  }

  async findAll(/*user: { id: string; role: string }*/): Promise<Project[]> {
    /*if (user.role === 'Employee') {
      return await this.ProjectsRepository.find({
        relations: ['referringEmployee', 'projectUser', 'projectUser.user'],
        where: { projectUser: { user: { id: user.id } } },
      });
    }*/
    return this.ProjectsRepository.find({
      relations: ['referringEmployee'],
    });
  }

  public async findAllIfEmp(userId: string): Promise<Project[]> {
    const projectsId: string[] =
      await this.projectUsersService.getProjectIdsByUser(userId);
    const allProjects: Project[] = [];
    await Promise.all(
      projectsId.map(async (projectId) =>
        allProjects.push(
          await this.ProjectsRepository.findOne({
            where: { id: projectId },
            relations: { referringEmployee: true },
          }),
        ),
      ),
    );
    return allProjects;
  }

  async projectExist(id: string) {
    try {
      await this.ProjectsRepository.findOneOrFail({
        where: {
          id: id,
        },
      });
    } catch {
      throw new NotFoundException();
    }
  }

  async projectByUser(userId: string, projectId: string): Promise<Project> {
    try {
      return this.ProjectsRepository.findOneOrFail({
        where: {
          id: projectId,
        },
      });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException();
      }
      throw new UnauthorizedException();
    }
  }

  async findProjectAdmin(projectId: string): Promise<Project> {
    try {
      return this.ProjectsRepository.findOneOrFail({
        where: { id: projectId },
      });
    } catch {
      throw new NotFoundException();
    }
  }
}
