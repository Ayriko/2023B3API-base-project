import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { EventType } from '../../event.enum';

export class CreateEventDto {
  @IsDateString()
  date!: Date;

  @IsString()
  @IsOptional()
  eventDescription?: string = null;

  @IsEnum(EventType)
  @IsNotEmpty()
  eventType!: EventType;
}
