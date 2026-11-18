import {
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UseInterceptors,
  Controller,
  Get,
  Body,
  Patch,
  Post,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { type UpdateProfile } from 'shared';
import 'multer';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { UserProfile } from 'shared';
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
  findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Get('email/:email')
  findByMail(@Param('email') email: string) {
    return this.userService.findByMail(email);
  }

  @Patch('update/:id')
  async update(
    @Param('id') username: string,
    @Body() updateUserDto: UpdateProfile,
  ) {
    const updatedUser = await this.userService.update(username, updateUserDto);
    return {
      message: `User updated correctly`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        name: updatedUser.name,
      },
    };
  }
  @Patch('update/:id/picture')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPicture(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(png|jpe?g|gif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const updatedUser = await this.userService.updatePicture(id, file);
    return { message: 'Picture updated', user: updatedUser };
  }

  @Delete('deluser/:username')
  async removeUser(@Param('username') username: string) {
    await this.userService.removeUser(username);

    return {
      status: 204,
      message: `User: '${username}' has been correctly deleted.`,
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
      message: `User: '${username}' has been correctly deleted.`,
    };
  }

  @Delete('id/:id')
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Get('friendlist')
  @UseGuards(JwtAuthGuard)
  getFriendList(@Req() req: { user: UserProfile }) {
    return this.userService.getFriendList(req.user.id);
  }

  @Delete('friends/remove/:friendId')
  @UseGuards(JwtAuthGuard)
  async removeFriend(
    @Req() req: { user: { id: string } },
    @Param('friendId') friendId: string,
  ) {
    return this.userService.removeFriend(req.user.id, friendId);
  }

  @Post('friends/add/:username')
  @UseGuards(JwtAuthGuard)
  async addFriend(
    @Req() req: { user: { id: string } },
    @Param('username') friendUsername: string,
  ) {
    return this.userService.addFriend(req.user.id, friendUsername);
  }
}
