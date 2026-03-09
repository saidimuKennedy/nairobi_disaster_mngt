
import prisma from '@/lib/db';
import { Case, Prisma } from '@prisma/client';
export type { Case as CaseData };

export class CaseModel {
  private static generateCaseId(caseType: string): string {
    const prefix = caseType === 'emergency' ? 'EMERG' : 
                   caseType === 'help' ? 'HELP' :
                   caseType === 'missing' ? 'MISS' : 'SHEL';
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 9).toUpperCase();
    return `${prefix}-${date}-${random}`;
  }

  static async create(
    reporterId: number,
    reporterPhone: string,
    caseType: string,
    subType: string,
    locationData: {
      constituency_id?: number;
      ward_id?: number;
      landmark?: string;
      latitude?: number;
      longitude?: number;
    },
    severityData: {
      dangerous: boolean;
      trapped: boolean;
      worsening: boolean;
      people_affected: number;
    },
    details: Prisma.InputJsonValue,
    reporterName?: string
  ): Promise<Case> {
    const caseId = this.generateCaseId(caseType);
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (severityData.dangerous || severityData.trapped) priority = 'high';
    if (severityData.trapped && severityData.people_affected > 5) priority = 'critical';

    const caseRecord = await prisma.case.create({
      data: {
        case_id: caseId,
        case_type: caseType,
        sub_type: subType,
        reporter_id: reporterId,
        reporter_phone: reporterPhone,
        reporter_name: reporterName || null,
        constituency_id: locationData.constituency_id || null,
        ward_id: locationData.ward_id || null,
        landmark: locationData.landmark || null,
        latitude: (locationData.latitude as unknown as Prisma.Decimal) || null,
        longitude: (locationData.longitude as unknown as Prisma.Decimal) || null,
        severity_dangerous: severityData.dangerous,
        severity_trapped: severityData.trapped,
        severity_worsening: severityData.worsening,
        people_affected: severityData.people_affected,
        priority: priority,
        details: details || Prisma.DbNull,
        status: 'submitted',
      },
    });

    await prisma.caseUpdate.create({
      data: {
        case_id: caseRecord.id,
        status_to: 'submitted',
        updated_by: 'system',
        update_message: 'Your report has been received.',
        visible_to_user: true,
      },
    });

    return caseRecord;
  }

  static async getByCaseId(caseId: string): Promise<Case | null> {
    return prisma.case.findUnique({
      where: { case_id: caseId, deleted_at: null },
    });
  }

  static async getById(caseInternalId: number): Promise<Case | null> {
    return prisma.case.findUnique({
      where: { id: caseInternalId, deleted_at: null },
    });
  }

  static async updateStatus(
    caseInternalId: number,
    newStatus: string,
    message: string
  ): Promise<Case> {
    const updatedCase = await prisma.case.update({
      where: { id: caseInternalId },
      data: {
        status: newStatus,
        updated_at: new Date(),
      },
    });

    await prisma.caseUpdate.create({
      data: {
        case_id: caseInternalId,
        status_to: newStatus,
        updated_by: 'system',
        update_message: message,
        visible_to_user: true,
      },
    });

    return updatedCase;
  }

  static async routeCase(caseInternalId: number, subType: string): Promise<Case> {
    const routing: Record<string, string> = {
      'flooding': 'Flood Response Team',
      'fire': 'Fire & Rescue',
      'medical': 'Ambulance Service',
      'building_collapse': 'Rescue Team',
      'road_accident': 'Traffic Management',
      'blocked_drainage': 'Green Army',
      'electrical_hazard': 'KPLC',
      'fallen_tree': 'Public Works',
      'evacuation': 'Relief & Evacuation',
    };

    const department = routing[subType.toLowerCase()] || 'County Command';

    const updatedCase = await prisma.case.update({
      where: { id: caseInternalId },
      data: {
        assigned_department: department,
        status: 'assigned',
        updated_at: new Date(),
      },
    });

    await prisma.caseUpdate.create({
      data: {
        case_id: caseInternalId,
        status_to: 'assigned',
        updated_by: 'system',
        update_message: `Case assigned to ${department}.`,
        visible_to_user: true,
      },
    });

    return updatedCase;
  }
}
