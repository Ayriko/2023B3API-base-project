import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from '../../role.enum';
import { ProjectUser } from '../../project-users/entities/project-user.entity';
import { Project } from '../../projects/entities/project.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ default: UserRole.Employee })
  role: UserRole;

  @OneToMany(() => ProjectUser, (projectUser: ProjectUser) => projectUser.user)
  projectUser: ProjectUser[];

  @OneToMany(() => Project, (project: Project) => project.referringEmployee)
  projects: Project[];
}
