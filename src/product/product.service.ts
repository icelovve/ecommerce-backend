import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from 'src/category/entities/category.entity';

@Injectable()
export class ProductService {
   constructor(
      @InjectRepository(Product)
      private productRepository: Repository<Product>,

      @InjectRepository(Category)
      private categoryRepository: Repository<Category>,
   ) { }

   async create(createProductDto: CreateProductDto): Promise<Product> {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
   }

   async findAll(): Promise<{ message: string; products?: any[] }> {
      const products = await this.productRepository.find();

      if (products.length === 0) {
         return { message: 'products not found' };
      }

      const categories = await this.categoryRepository.find();
      const categoryMap = new Map<number, string>();
      categories.forEach((cat) => categoryMap.set(cat.id, cat.name));

      const result = products.map((product) => ({
         id: product.id,
         name: product.name,
         description: product.description,
         price: product.price,
         stock: product.stock,
         category: {
            categoryId: product.categoryId,
            name: categoryMap.get(product.categoryId) || null,
         },
      }));

      return {
         message: 'products retrieved successfully',
         products: result,
      };
   }

   async findById(id: number): Promise<{ message: string; products?: any[] }> {
      const products = await this.productRepository.find({
         where: { id },
         relations: ['category'],
      });

      if (!products) {
         return { message: `productId ${id} not found` };
      }

      const result = products.map((product) => ({
         id: product.id,
         name: product.name,
         description: product.description,
         price: product.price,
         stock: product.stock,
         category: product.category
            ? {
               categoryId: product.category.id,
               name: product.category.name,
            }
            : null,
      }));

      return {
         message: 'product retrieved successfully',
         products: result,
      };
   }


   async update(id: number, updateProductDto: UpdateProductDto): Promise<Product | { message: string; updatedProduct?: Product }> {
      const result = await this.productRepository.update(id, updateProductDto);
      if (result.affected === 0) {
         return { message: 'product not affected' };
      }

      const updatedProduct = await this.productRepository.findOne({ where: { id } });
      if (!updatedProduct) {
         return { message: `productId ${id} not found` };
      }

      return { message: 'product updated successfully', updatedProduct };
   }


   async delete(id: number) {
      const product = await this.productRepository.findOne({ where: { id } })
      if (!product) {
         return { message: `productId ${id} not found` };
      }
      await this.productRepository.delete(id)
      return { message: 'delete product successfully' }
   }
}