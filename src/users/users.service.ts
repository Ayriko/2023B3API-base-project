import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { EventsService } from '../events/events.service';

//we can inject the UsersRepository into the UsersService using the @InjectRepository() decorator
//we use dto when there is incoming data

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly eventsService: EventsService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const saltRounds = 10;
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: await bcrypt.hash(createUserDto.password, saltRounds),
    });
    const inserted = await this.usersRepository.save(newUser);
    delete inserted.password;
    return inserted;
  }

  async signIn(email: string, pass: string) {
    const user = await this.findOneByEmail(email);
    const isMatch = await bcrypt.compare(pass, user?.password);
    if (isMatch == false) {
      throw new UnauthorizedException();
    }
    const payload = { id: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      select: ['id', 'username', 'email', 'role'],
      where: { id: id },
    });
  }

  findOneByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({
      select: ['id', 'username', 'email', 'role', 'password'],
      where: { email: email },
    });
  }

  async getVouchers(month: number, userId: string): Promise<number> {
    const firstMonthDay = new Date(new Date().getFullYear(), month - 1, 1);
    const lastMonthDay = new Date(new Date().getFullYear(), month, 0);

    let numberOfWeekdays = 0;
    const currentDate = new Date(firstMonthDay);

    while (currentDate <= lastMonthDay) {
      if (this.isWeekday(currentDate)) {
        numberOfWeekdays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const numberOfEventsInMonth = await this.eventsService.numberOfEventInMonth(
      userId,
      month,
    );

    return (numberOfWeekdays - numberOfEventsInMonth) * 8;
  }

  private isWeekday(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6;
  }
}
