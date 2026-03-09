
export type { 
  User, 
  Case, 
  Constituency, 
  Ward, 
  CaseMedia, 
  CaseUpdate 
} from '@prisma/client';

export type CaseType = 'emergency' | 'help' | 'missing' | 'shelter';

export interface SeverityData {
  dangerous: boolean;
  trapped: boolean;
  worsening: boolean;
  people_affected: number;
}

export interface LocationData {
  constituency_id?: number;
  ward_id?: number;
  landmark?: string;
  latitude?: number;
  longitude?: number;
}
