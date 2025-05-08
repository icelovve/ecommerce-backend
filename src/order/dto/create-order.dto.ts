import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, Min, ValidateNested } from 'class-validator';

export class OrderItemDto {
    @IsInt()
    @IsPositive()
    productId: number;

    @IsInt()
    @IsPositive()
    @Min(1)
    quantity: number;
}

export class CreateOrderDto {
    @IsInt()
    @IsNotEmpty()
    userId: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    orderItems: OrderItemDto[];

    @IsEnum(['pending', 'paid', 'shipped', 'completed', 'canceled'])
    @IsOptional()
    status?: 'pending' | 'paid' | 'shipped' | 'completed' | 'canceled' = 'pending';
}