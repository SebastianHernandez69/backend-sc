import { Controller, Get, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  //
  @Get('')
  async categories(){
    return await this.categoriesService.getCategories();
  }

  //Materia
  @Get('/materia/:idCategoria')
  async getMatByCategory(@Param('idCategoria') idCategoria: string){
    return this.categoriesService.getMatByCategory(parseInt(idCategoria));
  }
}
