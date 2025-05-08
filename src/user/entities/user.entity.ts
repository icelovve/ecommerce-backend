import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { IsOptional, IsNumberString, Length } from 'class-validator';
import { Order } from "src/order/entities/order.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    name?: string;

    @Column({ nullable: true })
    address?: string;

    @Column({ nullable: true })
    @IsOptional()
    @IsNumberString()
    @Length(10, 10, { message: 'Phone number must be exactly 10 digits' })
    phone?: string;

    @Column({ type: 'enum', enum: ['admin', 'user'], default: 'user' })
    role: 'admin' | 'user';

    @OneToMany(() => Order, (order) => order.user)
    orders: Order[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}