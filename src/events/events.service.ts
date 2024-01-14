import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { EventStatus, EventType } from '../event.enum';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly EventRepository: Repository<Event>,
  ) {}
  async create(createEventDto: CreateEventDto, userId: string) {
    const userEvents = await this.findByUserId(userId);
    const usedDates: Date[] = userEvents.map((userEvent) => userEvent.date);
    if (!this.isDateAvailable(createEventDto.date, usedDates)) {
      throw new UnauthorizedException();
    }
    let event_status: EventStatus;
    if (createEventDto.eventType === EventType.RemoteWork) {
      event_status = EventStatus.Accepted;
    }
    /*console.log('Saving event with values:', {
      date: createEventDto.date,
      eventDescription: createEventDto.eventDescription,
      eventStatus: event_status,
      eventType: createEventDto.eventType,
      userId: userId,
    });*/

    return await this.EventRepository.save({
      date: createEventDto.date,
      eventDescription: createEventDto.eventDescription,
      eventStatus: event_status,
      eventType: createEventDto.eventType,
      userId: userId,
    });
  }

  async findAll() {
    return this.EventRepository.find();
  }

  async findByUserId(userId: string) {
    return this.EventRepository.find({ where: { userId: userId } });
  }

  async findOne(eventId: string): Promise<Event> {
    try {
      return this.EventRepository.findOneOrFail({ where: { id: eventId } });
    } catch {
      throw new NotFoundException();
    }
  }

  isDateAvailable(dateToValidate: Date, dateList: Date[]) {
    const isDateWithinWeek = (date: Date) => {
      const firstWeekDay = new Date();
      firstWeekDay.setDate(date.getDate() - date.getDay());
      const lastWeekDay = new Date();
      lastWeekDay.setDate(firstWeekDay.getDate() + 6);
      return dateToValidate >= firstWeekDay && dateToValidate <= lastWeekDay;
    };

    const filteredDateList = dateList.filter(
      (date: Date) => !isDateWithinWeek(date),
    );

    if (filteredDateList.length < 2) {
      return !filteredDateList.some(
        (date: Date) =>
          new Date(date).getTime() === new Date(dateToValidate).getTime(),
      );
    }

    return false;
  }

  async validateAdmin(eventId: string) {
    const event: Event = await this.findOne(eventId);
    if (event.eventStatus !== EventStatus.Pending) {
      throw new ConflictException();
    }
    //save update si entity existe déjà !
    await this.EventRepository.save({
      eventStatus: EventStatus.Accepted,
      id: eventId,
    });
    return this.findOne(eventId);
  }
  async declineAdmin(eventId: string) {
    const event: Event = await this.findOne(eventId);
    if (event.eventStatus !== EventStatus.Pending) {
      throw new ConflictException();
    }
    await this.EventRepository.save({
      eventStatus: EventStatus.Declined,
      id: eventId,
    });
    return this.findOne(eventId);
  }
  //manque check du manager
  async validateManager(eventId: string, userId: string) {
    const event: Event = await this.findOne(eventId);
    if (event.eventStatus !== EventStatus.Pending) {
      throw new ConflictException();
    }
    //todo get manager projects (userId) & user projects (event.userId) to check if manager of the user at the event date
    await this.EventRepository.save({
      eventStatus: EventStatus.Accepted,
      id: eventId,
    });
    return this.findOne(eventId);
  }

  async declineManager(eventId: string, userId: string) {
    const event: Event = await this.findOne(eventId);
    if (event.eventStatus !== EventStatus.Pending) {
      throw new ConflictException();
    }
    await this.EventRepository.save({
      eventStatus: EventStatus.Declined,
      id: eventId,
    });
    return this.findOne(eventId);
  }

  async numberOfEventInMonth(userId: string, month: number) {
    const events: Event[] = await this.findByUserId(userId);
    const eventsInMonth = events.filter(
      (userEvent: Event) =>
        new Date(userEvent.date).getMonth() === month - 1 &&
        userEvent.eventStatus !== EventStatus.Pending,
    );

    return eventsInMonth.length;
  }
}
