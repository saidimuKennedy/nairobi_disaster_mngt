
import prisma from '@/lib/db';
import { CaseMedia } from '@prisma/client';

export class CaseMediaModel {
  static async addMedia(
    caseInternalId: number,
    fileType: string,
    fileUrl: string
  ): Promise<CaseMedia> {
    const media = await prisma.caseMedia.create({
      data: {
        case_id: caseInternalId,
        file_type: fileType,
        file_url: fileUrl,
      },
    });

    await prisma.case.update({
      where: { id: caseInternalId },
      data: {
        media_count: {
          increment: 1,
        },
      },
    });

    return media;
  }

  static async getByCase(caseInternalId: number): Promise<CaseMedia[]> {
    return prisma.caseMedia.findMany({
      where: { case_id: caseInternalId },
      orderBy: { uploaded_at: 'desc' },
    });
  }
}
