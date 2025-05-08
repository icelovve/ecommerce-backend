import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
   constructor(
      @InjectRepository(Category)
      private readonly categoryRepository: Repository<Category>,
   ) { }

   async create(createCategoryDto: CreateCategoryDto): Promise<{ message: string; data: Category }> {
      const category = this.categoryRepository.create(createCategoryDto);
      const result = await this.categoryRepository.save(category);
      return { message: 'Create category successfully', data: result };
   }

   async findAll() {
      const category = await this.categoryRepository.find({ select: ['id', 'name', 'description'] });
      if (category.length === 0) {
         return { message: 'category not found' };
      }
      return category;
   }

   async findOne(id: number) {
      const category = await this.categoryRepository.findOne({ where: { id }, select: ['id', 'name', 'description'] })
      if (!category) {
         return { message: `categoryId ${id} not found` };
      }

      return category
   }

   async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category | { message: string; updateCategory?: Category }> {
      const category = await this.categoryRepository.update(id, updateCategoryDto);
      if (category.affected === 0) {
         return { message: 'category not affected' };
      }

      const updateCategory = await this.categoryRepository.findOne({ where: { id } });
      if (!updateCategory) {
         return { message: `categoryId ${id} not found` };
      }

      return { message: 'Updated category successfully', updateCategory };
   }

   async remove(id: number) {
      const category = await this.categoryRepository.findOne({ where: { id } })

      if (!category) {
         return { message: `categoryId ${id} not found` };
      }

      await this.categoryRepository.delete(category)

      return { message: 'Delete category successfully' }

   }

}