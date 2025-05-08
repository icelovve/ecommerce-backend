import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
   constructor(
      @InjectRepository(User)
      private userRepository: Repository<User>
   ) { }

   async findAll() {
      try {
         const users = await this.userRepository.find({
            select: ['id', 'email', 'name', 'address']
         });
         if (users.length === 0) {
            return { message: 'user not found' };
         }
         return { message: 'user retrieved successfully', users };
      } catch (error) {
         throw new Error('Error retrieved user: ' + error);
      }
   }

   async findById(id: number) {
      try {
         const users = await this.userRepository.findOne({
            where: { id },
            select: ['id', 'email', 'name', 'address']
         })

         if (!users) {
            return { message: `user ID: ${id} not found` };
         }

         return { message: 'user retrieved successfully', users };

      } catch (error) {
         throw new Error('Error retrieved user: ' + error);
      }
   }

   async update(id: number, updateUserDto: UpdateUserDto): Promise<User | { message: string; updatedUser?: User }> {
      const users = await this.userRepository.update(id, updateUserDto)

      if (users.affected === 0) {
         return { message: 'user not affected' };
      }

      const updateUser = await this.userRepository.findOne({ where: { id } })
      if (!updateUser) {
         return { message: `user ID: ${id} not found` };
      }

      return { message: 'user updated successfully' };

   }

   async delete(id: number) {
      try {
         const user = await this.userRepository.findOne({ where: { id } });
         if (!user) {
            return { message: `user ID: ${id} not found` };
         }
         await this.userRepository.delete(id);
         return { message: 'delete successfully' };
      } catch (error) {
         throw new Error('Error delete user: ' + error);
      }
   }
}