import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProjectUser } from '../../project-users/entities/project-user.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  referringEmployeeId: string;

  @OneToMany(
    () => ProjectUser,
    (projectUser: ProjectUser) => projectUser.project,
  )
  projectUser: ProjectUser[];

  @ManyToOne(() => User, (user: User) => user.projects)
  referringEmployee: User;
}
