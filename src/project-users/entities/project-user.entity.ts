import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';

@Entity()
export class ProjectUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column('uuid')
  projectId: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, (user) => user.projectUser)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Project, (project: Project) => project.projectUser)
  @JoinColumn({ name: 'projectId' })
  project: Project;
}
