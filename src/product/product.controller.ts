import { Controller, Post, Body, Get, Patch, Param, Delete } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Post()
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return await this.productService.create(createProductDto);
  }

  @Get()
  async findAll(): Promise<{ message: string; products?: Product[] }> {
    return await this.productService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.productService.findById(Number(id))
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto
  ): Promise<Product | { message: string }> {
    return await this.productService.update(Number(id), updateProductDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.productService.delete(Number(id))
  }
}