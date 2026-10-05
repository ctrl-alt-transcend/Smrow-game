import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { Prisma } from '@prisma/client'

@Controller('user')
export class UserController {
  constructor(readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('username/:username')
  findbyUsername(@Param('username') username: string) {
    return this.userService.findbyUsername(username);
  }

  @Get('id/:id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Get('email/:email')
  findByMail(@Param('email') email: string) {
    return this.userService.findByMail(email);
  }

  @Patch('update/:username')
  async update(@Param('username') username: string, @Body() updateUserDto: Prisma.UserUpdateInput) {
     const updatedUser = await this.userService.update(username, updateUserDto);

    return {
      message: `User updated correctly`,
      user: {
        username: updatedUser.username,
        email: updatedUser.email,
        updatedAt:  updatedUser.updatedAt,
      }
    };
  }

  @Delete('deluser/:username')
  async removeUser(@Param('username') username: string) {
    await this.userService.removeUser(username);

    return {
      status: 204,
      message: `User: '${username}' has been correctly deleted.`
    };
  }

  // we could save the user using the findbyUsername and then execute the remove(id) istead. this needs to have an exception filter to avoid errors
  @Delete('deluserid/:username')
  async removeUserid(@Param('username') username: string) {
    const user = await this.userService.findbyUsername(username);

    if (user) {
      await this.userService.remove(user.id);
    }
    return {
      status: 200,
      message: `User: '${username}' has been correctly deleted.`
    };
  }


  @Delete('id/:id')
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

}
