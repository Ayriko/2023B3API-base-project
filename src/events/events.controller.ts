import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { AuthGuard } from '../auth.guard';
import { RolesGuard } from '../role.guard';
import { Request } from 'express';
import { Roles } from '../role.decorator';
import { UserRole } from '../role.enum';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createEventDto: CreateEventDto, @Req() req: Request) {
    const user = req.user as { id: string; role: string };
    return this.eventsService.create(createEventDto, user.id);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.eventsService.findAll();
  }
  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') eventId: string) {
    return this.eventsService.findOne(eventId);
  }

  @Post(':id/validate')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([UserRole.Admin, UserRole.ProjectManager])
  validate(@Param('id') eventId: string, @Req() req: Request) {
    const user = req.user as { id: string; role: string };
    //if admin
    if (user.role === UserRole.Admin) {
      return this.eventsService.validateAdmin(eventId);
    }
    //if manager
    if (user.role === UserRole.ProjectManager) {
      return this.eventsService.validateManager(eventId, user.id);
    }
  }

  @Post(':id/decline')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([UserRole.Admin, UserRole.ProjectManager])
  decline(@Param('id') eventId: string, @Req() req: Request) {
    const user = req.user as { id: string; role: string };
    //if admin
    if (user.role === UserRole.Admin) {
      return this.eventsService.declineAdmin(eventId);
    }
    //if manager
    if (user.role === UserRole.ProjectManager) {
      return this.eventsService.declineManager(eventId, user.id);
    }
  }
}
