import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Get(':userId')
  getUserOrders(@Param('userId') userId: string) {
    return this.orderService.getUserOrders(+userId)
  }

  @Patch(':id')
  updateStatus(@Param('id') id: string, status: 'pending' | 'paid' | 'shipped' | 'completed' | 'canceled') {
    return this.orderService.updateStatus(+id, status)
  }
}
