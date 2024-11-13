import { Body, Controller, Get, Param, ParseIntPipe, Put, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('/get-users')
  // @UseGuards(JwtAuthGuard)
  async getUsers(@Query("idRol") idRol?: string){
    const rol = idRol ? Number(idRol) : undefined;

    return await this.adminService.getUsers(rol);
  }

  @Put("/user/change-state/:idUsuario")
  async changeUserState(@Param('idUsuario', ParseIntPipe) idUsuario: number){
    return await this.adminService.changeUserState(idUsuario);
  }

}
