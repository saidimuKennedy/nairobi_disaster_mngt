
import { UserModel } from '@/lib/models/User';
import { User } from '@prisma/client';

export class UserService {
  static async getOrCreateUser(phoneNumber: string, name?: string): Promise<User> {
    return UserModel.getOrCreate(phoneNumber, name);
  }

  static async getUserByPhone(phoneNumber: string): Promise<User | null> {
    return UserModel.getByPhone(phoneNumber);
  }

  static async getUserById(id: number): Promise<User | null> {
    return UserModel.getById(id);
  }
}
