import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Request } from 'express';
import { JwtPayload } from 'src/interfaces/JwtPayload';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/aggMateria')
  @UseGuards(JwtAuthGuard)
  async aggMateriaToUser(@Req() req: Request){

    const user = req.user as JwtPayload;
    return await this.userService.addMateriaToUser(user.sub, req.body.idMateria, user.rol);
  }
}
