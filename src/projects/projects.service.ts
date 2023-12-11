import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/createProject.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly ProjectsRepository: Repository<Project>,
    private readonly usersService: UsersService,
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
      relations: {
        referringEmployee: true,
      },
    });
  }

  // passer en double request, user vers project user, project user vers project
  // revoir les relations (pas triangulaire)
  // faire schéma avec R, A/B/C
  async findAll(user: { id: string; role: string }): Promise<Project[]> {
    if (user.role === 'Employee') {
      const rep = await this.ProjectsRepository.find({
        where: { projectUser: { id: user.id } },
        relations: { referringEmployee: true },
      });
      return rep;
    }
    return this.ProjectsRepository.find({
      relations: { referringEmployee: true },
    });
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
}
