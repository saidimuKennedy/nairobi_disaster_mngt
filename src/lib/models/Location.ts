
import prisma from '@/lib/db';
import { Constituency, Ward } from '@prisma/client';
export type { Constituency, Ward };

export class LocationModel {
  static async getConstituencies(): Promise<Constituency[]> {
    return prisma.constituency.findMany({
      orderBy: { name: 'asc' },
    });
  }

  static async getWards(constituencyId: number): Promise<Ward[]> {
    return prisma.ward.findMany({
      where: { constituency_id: constituencyId },
      orderBy: { name: 'asc' },
    });
  }

  static async getConstituencyByName(name: string): Promise<Constituency | null> {
    return prisma.constituency.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });
  }

  static async getWardByName(wardName: string, constituencyId: number): Promise<Ward | null> {
    return prisma.ward.findFirst({
      where: {
        name: {
          equals: wardName,
          mode: 'insensitive',
        },
        constituency_id: constituencyId,
      },
    });
  }
}
