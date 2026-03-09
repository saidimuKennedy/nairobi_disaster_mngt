
import prisma from '@/lib/db';
import { CaseUpdate } from '@prisma/client';

export class CaseUpdateModel {
  static async getForUser(caseInternalId: number): Promise<CaseUpdate[]> {
    return prisma.caseUpdate.findMany({
      where: {
        case_id: caseInternalId,
        visible_to_user: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }
}
