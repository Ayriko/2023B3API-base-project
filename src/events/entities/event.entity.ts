import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EventStatus, EventType } from '../../event.enum';

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'timestamp' })
  date!: Date;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.Pending })
  eventStatus?: EventStatus;

  @Column({ type: 'enum', enum: EventType })
  eventType!: EventType;

  @Column()
  eventDescription?: string | null;

  @Column('uuid')
  userId!: string;
}
