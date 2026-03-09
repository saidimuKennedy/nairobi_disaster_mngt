import { CaseModel } from '@/lib/models/Case';
import { UserModel } from '@/lib/models/User';
import { LocationModel } from '@/lib/models/Location';
import { CaseUpdateModel } from '@/lib/models/CaseUpdate';
import { CaseMediaModel } from '@/lib/models/CaseMedia';
import { Prisma } from '@prisma/client';

export class CaseService {
  static async submitEmergency(
    phoneNumber: string,
    data: {
      emergency_type: string;
      constituency: string;
      ward: string;
      landmark?: string;
      latitude?: number;
      longitude?: number;
      severity: { dangerous: boolean; trapped: boolean; worsening: boolean; people_affected: number };
      details: Prisma.InputJsonValue;
      media_urls?: string[];
      reporter_name?: string;
    }
  ): Promise<{ caseId: string; priority: string; message: string }> {
    const user = await UserModel.getOrCreate(phoneNumber, data.reporter_name);
    
    // Try to find IDs but don't fail if not found (lenient for testing)
    const constituency = await LocationModel.getConstituencyByName(data.constituency);
    const ward = constituency ? await LocationModel.getWardByName(data.ward, constituency.id) : null;

    const caseRecord = await CaseModel.create(
      user.id,
      phoneNumber,
      'emergency',
      data.emergency_type,
      { 
        constituency_id: constituency?.id, 
        ward_id: ward?.id, 
        landmark: data.landmark, 
        latitude: data.latitude, 
        longitude: data.longitude 
      },
      data.severity,
      data.details,
      data.reporter_name
    );

    await CaseModel.routeCase(caseRecord.id, data.emergency_type);

    if (data.media_urls && data.media_urls.length > 0) {
      for (const url of data.media_urls) {
        await CaseMediaModel.addMedia(caseRecord.id, 'photo', url);
      }
    }

    return {
      caseId: caseRecord.case_id,
      priority: caseRecord.priority,
      message: `Emergency reported. Case ID: ${caseRecord.case_id}`,
    };
  }

  static async submitHelpRequest(
    phoneNumber: string,
    data: {
      help_type: string;
      constituency: string;
      ward: string;
      landmark?: string;
      urgency: { life_threatening: boolean; people_affected: number };
      media_urls?: string[];
    }
  ): Promise<{ caseId: string; priority: string; message: string }> {
    const user = await UserModel.getOrCreate(phoneNumber);
    
    const constituency = await LocationModel.getConstituencyByName(data.constituency);
    const ward = constituency ? await LocationModel.getWardByName(data.ward, constituency.id) : null;

    const caseRecord = await CaseModel.create(
      user.id,
      phoneNumber,
      'help',
      data.help_type,
      { 
        constituency_id: constituency?.id, 
        ward_id: ward?.id, 
        landmark: data.landmark 
      },
      { dangerous: data.urgency.life_threatening, trapped: false, worsening: false, people_affected: data.urgency.people_affected },
      data.urgency
    );

    await CaseModel.routeCase(caseRecord.id, data.help_type);

    if (data.media_urls && data.media_urls.length > 0) {
      for (const url of data.media_urls) {
        await CaseMediaModel.addMedia(caseRecord.id, 'photo', url);
      }
    }

    return {
      caseId: caseRecord.case_id,
      priority: caseRecord.priority,
      message: `Help request received. Case ID: ${caseRecord.case_id}`,
    };
  }

  static async submitMissingPerson(
    phoneNumber: string,
    data: {
      missing_type: string;
      constituency: string;
      ward: string;
      landmark?: string;
      person_details: { name: string; age?: number; description: string };
      media_urls?: string[];
    }
  ): Promise<{ caseId: string; priority: string; message: string }> {
    const user = await UserModel.getOrCreate(phoneNumber);
    
    const constituency = await LocationModel.getConstituencyByName(data.constituency);
    const ward = constituency ? await LocationModel.getWardByName(data.ward, constituency.id) : null;

    const caseRecord = await CaseModel.create(
      user.id,
      phoneNumber,
      'missing',
      data.missing_type,
      { 
        constituency_id: constituency?.id, 
        ward_id: ward?.id, 
        landmark: data.landmark 
      },
      { dangerous: false, trapped: false, worsening: false, people_affected: 1 },
      data.person_details
    );

    await CaseModel.routeCase(caseRecord.id, 'missing_person');

    if (data.media_urls && data.media_urls.length > 0) {
      for (const url of data.media_urls) {
        await CaseMediaModel.addMedia(caseRecord.id, 'photo', url);
      }
    }

    return {
      caseId: caseRecord.case_id,
      priority: caseRecord.priority,
      message: `Missing person report received. Case ID: ${caseRecord.case_id}`,
    };
  }

  static async submitShelterRequest(
    phoneNumber: string,
    data: {
      shelter_type: string;
      constituency: string;
      ward: string;
      landmark?: string;
      needs: { food: boolean; water: boolean; shelter: boolean; people_count: number };
      media_urls?: string[];
    }
  ): Promise<{ caseId: string; priority: string; message: string }> {
    const user = await UserModel.getOrCreate(phoneNumber);
    
    const constituency = await LocationModel.getConstituencyByName(data.constituency);
    const ward = constituency ? await LocationModel.getWardByName(data.ward, constituency.id) : null;

    const caseRecord = await CaseModel.create(
      user.id,
      phoneNumber,
      'shelter',
      data.shelter_type,
      { 
        constituency_id: constituency?.id, 
        ward_id: ward?.id, 
        landmark: data.landmark 
      },
      { dangerous: false, trapped: false, worsening: false, people_affected: data.needs.people_count },
      data.needs
    );

    await CaseModel.routeCase(caseRecord.id, 'evacuation');

    if (data.media_urls && data.media_urls.length > 0) {
      for (const url of data.media_urls) {
        await CaseMediaModel.addMedia(caseRecord.id, 'photo', url);
      }
    }

    return {
      caseId: caseRecord.case_id,
      priority: caseRecord.priority,
      message: `Shelter/Relief request received. Case ID: ${caseRecord.case_id}`,
    };
  }

  static async getUserCaseDetails(caseId: string, phoneNumber: string): Promise<unknown> {
    const caseRecord = await CaseModel.getByCaseId(caseId);
    if (!caseRecord) throw new Error('Case not found');
    if (caseRecord.reporter_phone !== phoneNumber) throw new Error('Unauthorized');

    const updates = await CaseUpdateModel.getForUser(caseRecord.id);

    return {
      case_id: caseRecord.case_id,
      status: caseRecord.status,
      priority: caseRecord.priority,
      assigned_department: caseRecord.assigned_department,
      updates,
    };
  }
}
