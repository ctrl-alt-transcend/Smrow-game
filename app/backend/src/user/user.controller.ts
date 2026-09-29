import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { Prisma } from '@prisma/client'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: Prisma.UserCreateInput ) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('username/:username')
  findbyUsername(@Param('username') username: string) {
    return this.userService.findbyUsername(username);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: Prisma.UserUpdateInput) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete('deluser/:username')
  removeUser(@Param('username') username: string) {
    return this.userService.removeUser(username);
  }

  // we could save the user using the findbyUsername and then execute the remove(id) istead. this needs to have an exception filter to avoid errors
  //@Delete('deluser/:username')
  //async removeUserid(@Param('username') username: string) {
  //  const user = await this.userService.findbyUsername(username);

  //  return this.userService.remove(user.id)
  //}


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
