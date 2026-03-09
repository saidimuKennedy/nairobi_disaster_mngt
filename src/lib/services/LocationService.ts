
import { LocationModel, Constituency, Ward } from '@/lib/models/Location';

export class LocationService {
  static async getAllConstituencies(): Promise<Constituency[]> {
    return LocationModel.getConstituencies();
  }

  static async getWardsForConstituency(constituencyId: number): Promise<Ward[]> {
    return LocationModel.getWards(constituencyId);
  }

  static async validateLocation(constituencyName: string, wardName: string): Promise<boolean> {
    const constituency = await LocationModel.getConstituencyByName(constituencyName);
    if (!constituency) return false;
    
    const ward = await LocationModel.getWardByName(wardName, constituency.id);
    return !!ward;
  }
}
