
import prisma from '@/lib/db';
import { User } from '@prisma/client';

export class UserModel {
  static async getOrCreate(phoneNumber: string, name?: string): Promise<User> {
    const existing = await prisma.user.findUnique({
      where: { phone_number: phoneNumber },
    });

    if (existing) {
      return existing;
    }

    return prisma.user.create({
      data: {
        phone_number: phoneNumber,
        name: name || null,
        preferred_language: 'en',
      },
    });
  }

  static async getByPhone(phoneNumber: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { phone_number: phoneNumber },
    });
  }

  static async getById(userId: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  }
}
