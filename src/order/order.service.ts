import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Product } from '../product/entities/product.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private dataSource: DataSource,
  ) { }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (createOrderDto.orderItems.length === 0) {
        throw new BadRequestException('An order must contain at least one product');
      }

      const newOrder = this.orderRepository.create({
        userId: createOrderDto.userId,
        status: createOrderDto.status || 'pending',
        totalPrice: 0,
      });

      const savedOrder = await queryRunner.manager.save(newOrder);

      let totalPrice = 0;

      for (const item of createOrderDto.orderItems) {
        const product = await this.productRepository.findOne({
          where: { id: item.productId }
        });

        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(`Not enough stock for product ${product.name}. Available: ${product.stock}`);
        }

        product.stock -= item.quantity;
        await queryRunner.manager.save(product);

        const orderItem = this.orderItemRepository.create({
          orderId: savedOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          subtotal: product.price * item.quantity,
        });

        await queryRunner.manager.save(orderItem);

        totalPrice += orderItem.subtotal;
      }

      savedOrder.totalPrice = totalPrice;
      await queryRunner.manager.save(savedOrder);

      await queryRunner.commitTransaction()

      const result = await this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.orderItems', 'orderItems')
        .leftJoinAndSelect('orderItems.product', 'product')
        .leftJoinAndSelect('order.user', 'user')
        .select([
          'order',
          'orderItems',
          'product',
          'user.name',
          'user.email',
          'user.address',
          'user.phone'
        ])
        .where('order.id = :id', { id: savedOrder.id })
        .getOne();

      if (!result) {
        throw new NotFoundException(`Created order with ID ${savedOrder.id} not found`);
      }

      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'product')
      .leftJoinAndSelect('order.user', 'user')
      .select([
        'order',
        'orderItems',
        'product',
        'user.name',
        'user.address',
        'user.phone',
        'user.email'
      ])
      .getMany();
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'product')
      .leftJoinAndSelect('order.user', 'user')
      .select([
        'order',
        'orderItems',
        'product',
        'user.name',
        'user.address',
        'user.phone',
        'user.email'
      ])
      .where('order.id = :id', { id })
      .getOne();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['orderItems', 'orderItems.product'],
    });
  }

  async updateStatus(id: number, status: 'pending' | 'paid' | 'shipped' | 'completed' | 'canceled'): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;
    return this.orderRepository.save(order);
  }
}