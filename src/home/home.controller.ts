import { Controller, Get, Param } from '@nestjs/common';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {};

  @Get('/:id')
  homeUser(@Param('id') id: string){
    return this.homeService.constGetHomeUser(parseInt(id));
  }

}
