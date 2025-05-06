import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
   constructor(
      @InjectRepository(Product)
      private productRepository: Repository<Product>,
   ) { }

   async create(createProductDto: CreateProductDto): Promise<Product> {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
   }

   async findAll(): Promise<{ message: string; products?: Product[] }> {
      const products = await this.productRepository.find();
      if (products.length === 0) {
         return { message: 'products not found' };
      }
      return {
         message: 'products retrieved successfully',
         products,
      };
   }

   async findById(id: number) {
      const product = await this.productRepository.findOne({
         where: { id },
      });
      if (!product) {
         return { message: 'product not found' };
      }
      return {
         message: 'product retrieved successfully',
         product,
      };
   }

   async update(id: number, updateProductDto: UpdateProductDto): Promise<Product | { message: string; updatedProduct?: Product }> {
      const result = await this.productRepository.update(id, updateProductDto);
      if (result.affected === 0) {
         return { message: 'product not found' };
      }

      const updatedProduct = await this.productRepository.findOne({ where: { id } });
      if (!updatedProduct) {
         return { message: 'product not found' };
      }

      return { message: 'product updated successfully', updatedProduct };
   }


   async delete(id: number) {
      const product = await this.productRepository.findOne({ where: { id } })
      if (!product) {
         return { message: 'product not found' };
      }
      await this.productRepository.delete(id)
      return { message: 'delete product successfully' }
   }
}