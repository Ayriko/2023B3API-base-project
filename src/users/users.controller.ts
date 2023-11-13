import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { SignInDto } from './dto/signIn.dto';
import { AuthGuard } from './auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post(':auth/sign-up')
  @UsePipes(ValidationPipe)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('auth/login')
  signIn(@Body() signInDto: SignInDto) {
    return this.usersService.signIn(signInDto.email, signInDto.password);
  }

  @UseGuards(AuthGuard)
  @Get(':me')
  getUser(@Req() req: any) {
    return this.usersService.findOne(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(id);
  // }
}
