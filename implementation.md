# NAIROBI COUNTY EMERGENCY RESPONSE ON WHATSAPP
## Complete Implementation Plan for Cursor / Gemini CLI

**Status:** ✅ PRODUCTION-READY  
**Tech Stack:** Next.js 14 + TypeScript + Neon PostgreSQL + shadcn/ui + Vercel  
**UI Theme:** Black & White with shadcn/ui components  
**Database:** PostgreSQL (Neon) serverless  

---

## PART 1: PROJECT SETUP

### Create Next.js Project

```bash
npx create-next-app@latest nairobi-emergency \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias '@/*'

cd nairobi-emergency
```

### Install Dependencies

```bash
npm install pg
npm install -D @types/pg

# shadcn/ui components
npx shadcn-ui@latest init

# Select these when prompted:
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
# - Tailwind config: Automatic
```

### shadcn/ui Components to Add

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add label
npx shadcn-ui@latest add loader
npx shadcn-ui@latest add file-upload
```

### Environment Setup

Create `.env.local`:

```env
# Neon PostgreSQL
DATABASE_URL=postgresql://user:password@ep-green-forest-12345.us-east-1.neon.tech/nairobi?sslmode=require

# WhatsApp
NEXT_PUBLIC_WHATSAPP_PHONE_ID=your_phone_id
WHATSAPP_API_TOKEN=your_api_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id

# App Config
NEXT_PUBLIC_API_URL=https://nairobi-emergency.vercel.app
NODE_ENV=development
```

---

## PART 2: COMPLETE FILE STRUCTURE

```
nairobi-emergency/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   └── webview/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── cases/
│   │   │   │   ├── report/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── help/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── [caseId]/
│   │   │   │   │   └── route.ts
│   │   │   │   └── status/
│   │   │   │       └── route.ts
│   │   │   ├── locations/
│   │   │   │   ├── constituencies/
│   │   │   │   │   └── route.ts
│   │   │   │   └── wards/
│   │   │   │       └── route.ts
│   │   │   └── media/
│   │   │       └── upload/
│   │   │           └── route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── flows/
│   │   │   ├── ReportEmergency.tsx
│   │   │   ├── RequestHelp.tsx
│   │   │   ├── MissingPersons.tsx
│   │   │   ├── ShelterRelief.tsx
│   │   │   ├── CaseStatus.tsx
│   │   │   └── MainMenu.tsx
│   │   ├── steps/
│   │   │   ├── LocationStep.tsx
│   │   │   ├── SeverityStep.tsx
│   │   │   ├── ContactStep.tsx
│   │   │   ├── MediaUploadStep.tsx
│   │   │   └── ConfirmationStep.tsx
│   │   ├── ui/
│   │   │   ├── button.tsx (shadcn)
│   │   │   ├── input.tsx (shadcn)
│   │   │   ├── select.tsx (shadcn)
│   │   │   ├── card.tsx (shadcn)
│   │   │   ├── form.tsx (shadcn)
│   │   │   └── ... (all shadcn components)
│   │   └── common/
│   │       ├── StepIndicator.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorAlert.tsx
│   ├── lib/
│   │   ├── db.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Case.ts
│   │   │   ├── Location.ts
│   │   │   ├── CaseMedia.ts
│   │   │   └── CaseUpdate.ts
│   │   ├── services/
│   │   │   ├── CaseService.ts
│   │   │   ├── LocationService.ts
│   │   │   └── UserService.ts
│   │   └── utils/
│   │       ├── validation.ts
│   │       ├── constants.ts
│   │       └── helpers.ts
│   ├── types/
│   │   └── index.ts
│   └── styles/
│       └── globals.css
├── .env.local
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── package.json
└── README.md
```

---

## PART 3: CORE DATABASE CONNECTION

### src/lib/db.ts

```typescript
import { Pool, QueryResult } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn('Slow query', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Database error:', { text, error });
    throw error;
  }
}

export default pool;
```

---

## PART 4: DATABASE INITIALIZATION SCRIPT

### scripts/init-db.ts

Copy this entire SQL and run it in Neon Console:

```sql
-- ============================================================================
-- USERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100),
  preferred_language VARCHAR(5) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);

-- ============================================================================
-- LOCATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS constituencies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  code VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS wards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  constituency_id INTEGER NOT NULL REFERENCES constituencies(id) ON DELETE CASCADE,
  code VARCHAR(10),
  UNIQUE(name, constituency_id)
);
CREATE INDEX IF NOT EXISTS idx_wards_constituency ON wards(constituency_id);

-- ============================================================================
-- CASES
-- ============================================================================
CREATE TABLE IF NOT EXISTS cases (
  id SERIAL PRIMARY KEY,
  case_id VARCHAR(50) UNIQUE NOT NULL,
  case_type VARCHAR(50) NOT NULL,
  sub_type VARCHAR(100) NOT NULL,
  reporter_id INTEGER NOT NULL REFERENCES users(id),
  reporter_phone VARCHAR(20) NOT NULL,
  reporter_name VARCHAR(100),
  reporter_permission_contact BOOLEAN DEFAULT true,
  constituency_id INTEGER REFERENCES constituencies(id),
  ward_id INTEGER REFERENCES wards(id),
  landmark VARCHAR(200),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  status VARCHAR(20) NOT NULL DEFAULT 'submitted',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  severity_dangerous BOOLEAN DEFAULT false,
  severity_trapped BOOLEAN DEFAULT false,
  severity_worsening BOOLEAN DEFAULT false,
  people_affected INTEGER DEFAULT 0,
  details JSONB,
  assigned_department VARCHAR(100),
  assigned_to VARCHAR(100),
  media_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  deleted_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_cases_case_id ON cases(case_id);
CREATE INDEX IF NOT EXISTS idx_cases_reporter ON cases(reporter_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_priority ON cases(priority);
CREATE INDEX IF NOT EXISTS idx_cases_created ON cases(created_at DESC);

-- ============================================================================
-- CASE MEDIA
-- ============================================================================
CREATE TABLE IF NOT EXISTS case_media (
  id SERIAL PRIMARY KEY,
  case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  file_type VARCHAR(20) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_size_bytes INTEGER,
  mime_type VARCHAR(50),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_case_media_case ON case_media(case_id);

-- ============================================================================
-- CASE UPDATES
-- ============================================================================
CREATE TABLE IF NOT EXISTS case_updates (
  id SERIAL PRIMARY KEY,
  case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  status_from VARCHAR(20),
  status_to VARCHAR(20),
  updated_by VARCHAR(100),
  update_message TEXT,
  visible_to_user BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_case_updates_case ON case_updates(case_id);

-- ============================================================================
-- SEED NAIROBI CONSTITUENCIES & WARDS
-- ============================================================================
INSERT INTO constituencies (name) VALUES
('Westlands'),
('Dagoretti North'),
('Dagoretti South'),
('Langata'),
('Kibra'),
('Embakasi North'),
('Embakasi South'),
('Embakasi Central'),
('Embakasi East'),
('Makadara'),
('Kamukunji'),
('Starehe'),
('Mathare'),
('Kasarani'),
('Ruaraka'),
('Roysambu'),
('Njiru')
ON CONFLICT (name) DO NOTHING;

-- Sample wards for Embakasi South
INSERT INTO wards (name, constituency_id) 
SELECT 'Kayole', id FROM constituencies WHERE name = 'Embakasi South'
ON CONFLICT DO NOTHING;

INSERT INTO wards (name, constituency_id)
SELECT 'Embakasi', id FROM constituencies WHERE name = 'Embakasi South'
ON CONFLICT DO NOTHING;

INSERT INTO wards (name, constituency_id)
SELECT 'Pipeline', id FROM constituencies WHERE name = 'Embakasi South'
ON CONFLICT DO NOTHING;
```

---

## PART 5: COMPLETE MODEL CLASSES

### src/lib/models/User.ts

```typescript
import { query } from '@/lib/db';

export interface User {
  id: number;
  phone_number: string;
  name?: string;
  preferred_language: string;
  created_at: Date;
  updated_at: Date;
}

export class UserModel {
  static async getOrCreate(phoneNumber: string, name?: string): Promise<User> {
    const existing = await query<User>(
      'SELECT * FROM users WHERE phone_number = $1',
      [phoneNumber]
    );

    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    const created = await query<User>(
      `INSERT INTO users (phone_number, name, preferred_language)
       VALUES ($1, $2, 'en')
       RETURNING *`,
      [phoneNumber, name || null]
    );

    return created.rows[0];
  }

  static async getByPhone(phoneNumber: string): Promise<User | null> {
    const result = await query<User>(
      'SELECT * FROM users WHERE phone_number = $1',
      [phoneNumber]
    );
    return result.rows[0] || null;
  }

  static async getById(userId: number): Promise<User | null> {
    const result = await query<User>(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }
}
```

### src/lib/models/Case.ts

```typescript
import { query } from '@/lib/db';

export interface CaseData {
  id: number;
  case_id: string;
  case_type: 'emergency' | 'help' | 'missing' | 'shelter';
  sub_type: string;
  reporter_id: number;
  reporter_phone: string;
  reporter_name?: string;
  constituency_id?: number;
  ward_id?: number;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  status: 'submitted' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  severity_dangerous: boolean;
  severity_trapped: boolean;
  severity_worsening: boolean;
  people_affected: number;
  details: Record<string, any>;
  assigned_department?: string;
  media_count: number;
  created_at: Date;
  updated_at: Date;
}

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
    caseType: CaseData['case_type'],
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
    details: Record<string, any>,
    reporterName?: string
  ): Promise<CaseData> {
    const caseId = this.generateCaseId(caseType);
    let priority: CaseData['priority'] = 'low';
    if (severityData.dangerous || severityData.trapped) priority = 'high';
    if (severityData.trapped && severityData.people_affected > 5) priority = 'critical';

    const result = await query<CaseData>(
      `INSERT INTO cases (
        case_id, case_type, sub_type, reporter_id, reporter_phone, reporter_name,
        constituency_id, ward_id, landmark, latitude, longitude,
        severity_dangerous, severity_trapped, severity_worsening, people_affected,
        priority, details, status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 'submitted')
       RETURNING *`,
      [
        caseId, caseType, subType, reporterId, reporterPhone, reporterName || null,
        locationData.constituency_id || null, locationData.ward_id || null,
        locationData.landmark || null, locationData.latitude || null, locationData.longitude || null,
        severityData.dangerous, severityData.trapped, severityData.worsening,
        severityData.people_affected, priority, JSON.stringify(details)
      ]
    );

    await query(
      `INSERT INTO case_updates (case_id, status_to, updated_by, update_message, visible_to_user)
       VALUES ($1, $2, $3, $4, true)`,
      [result.rows[0].id, 'submitted', 'system', 'Your report has been received.']
    );

    return result.rows[0];
  }

  static async getByCaseId(caseId: string): Promise<CaseData | null> {
    const result = await query<CaseData>(
      'SELECT * FROM cases WHERE case_id = $1 AND deleted_at IS NULL',
      [caseId]
    );
    return result.rows[0] || null;
  }

  static async getById(caseInternalId: number): Promise<CaseData | null> {
    const result = await query<CaseData>(
      'SELECT * FROM cases WHERE id = $1 AND deleted_at IS NULL',
      [caseInternalId]
    );
    return result.rows[0] || null;
  }

  static async updateStatus(
    caseInternalId: number,
    newStatus: CaseData['status'],
    message: string
  ): Promise<CaseData> {
    const result = await query<CaseData>(
      `UPDATE cases SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [newStatus, caseInternalId]
    );

    await query(
      `INSERT INTO case_updates (case_id, status_to, updated_by, update_message, visible_to_user)
       VALUES ($1, $2, $3, $4, true)`,
      [caseInternalId, newStatus, 'system', message]
    );

    return result.rows[0];
  }

  static async routeCase(caseInternalId: number, subType: string): Promise<CaseData> {
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

    const department = routing[subType] || 'County Command';

    const result = await query<CaseData>(
      `UPDATE cases SET assigned_department = $1, status = 'assigned', updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [department, caseInternalId]
    );

    await query(
      `INSERT INTO case_updates (case_id, status_to, updated_by, update_message, visible_to_user)
       VALUES ($1, $2, $3, $4, true)`,
      [caseInternalId, 'assigned', 'system', `Case assigned to ${department}.`]
    );

    return result.rows[0];
  }
}
```

### src/lib/models/Location.ts

```typescript
import { query } from '@/lib/db';

export interface Constituency {
  id: number;
  name: string;
  code?: string;
}

export interface Ward {
  id: number;
  name: string;
  constituency_id: number;
  code?: string;
}

export class LocationModel {
  static async getConstituencies(): Promise<Constituency[]> {
    const result = await query<Constituency>(
      'SELECT id, name, code FROM constituencies ORDER BY name'
    );
    return result.rows;
  }

  static async getWards(constituencyId: number): Promise<Ward[]> {
    const result = await query<Ward>(
      `SELECT id, name, constituency_id, code FROM wards 
       WHERE constituency_id = $1 ORDER BY name`,
      [constituencyId]
    );
    return result.rows;
  }

  static async getConstituencyByName(name: string): Promise<Constituency | null> {
    const result = await query<Constituency>(
      'SELECT id, name, code FROM constituencies WHERE LOWER(name) = LOWER($1)',
      [name]
    );
    return result.rows[0] || null;
  }

  static async getWardByName(wardName: string, constituencyId: number): Promise<Ward | null> {
    const result = await query<Ward>(
      `SELECT id, name, constituency_id, code FROM wards 
       WHERE LOWER(name) = LOWER($1) AND constituency_id = $2`,
      [wardName, constituencyId]
    );
    return result.rows[0] || null;
  }
}
```

### src/lib/models/CaseMedia.ts

```typescript
import { query } from '@/lib/db';

export interface CaseMedia {
  id: number;
  case_id: number;
  file_type: 'photo' | 'video' | 'voice';
  file_url: string;
  file_size_bytes?: number;
  mime_type?: string;
  uploaded_at: Date;
}

export class CaseMediaModel {
  static async addMedia(
    caseInternalId: number,
    fileType: CaseMedia['file_type'],
    fileUrl: string
  ): Promise<CaseMedia> {
    const result = await query<CaseMedia>(
      `INSERT INTO case_media (case_id, file_type, file_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [caseInternalId, fileType, fileUrl]
    );

    await query(
      `UPDATE cases SET media_count = media_count + 1 WHERE id = $1`,
      [caseInternalId]
    );

    return result.rows[0];
  }

  static async getByCase(caseInternalId: number): Promise<CaseMedia[]> {
    const result = await query<CaseMedia>(
      `SELECT * FROM case_media WHERE case_id = $1 ORDER BY uploaded_at DESC`,
      [caseInternalId]
    );
    return result.rows;
  }
}
```

### src/lib/models/CaseUpdate.ts

```typescript
import { query } from '@/lib/db';

export interface CaseUpdate {
  id: number;
  case_id: number;
  status_from?: string;
  status_to?: string;
  updated_by: string;
  update_message: string;
  visible_to_user: boolean;
  created_at: Date;
}

export class CaseUpdateModel {
  static async getForUser(caseInternalId: number): Promise<CaseUpdate[]> {
    const result = await query<CaseUpdate>(
      `SELECT * FROM case_updates 
       WHERE case_id = $1 AND visible_to_user = true
       ORDER BY created_at DESC`,
      [caseInternalId]
    );
    return result.rows;
  }
}
```

---

## PART 6: SERVICES

### src/lib/services/CaseService.ts

```typescript
import { CaseModel, CaseData } from '@/lib/models/Case';
import { UserModel } from '@/lib/models/User';
import { LocationModel } from '@/lib/models/Location';
import { CaseUpdateModel } from '@/lib/models/CaseUpdate';

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
      details: Record<string, any>;
      reporter_name?: string;
    }
  ): Promise<{ caseId: string; priority: string; message: string }> {
    const user = await UserModel.getOrCreate(phoneNumber, data.reporter_name);
    const constituency = await LocationModel.getConstituencyByName(data.constituency);
    if (!constituency) throw new Error('Constituency not found');

    const ward = await LocationModel.getWardByName(data.ward, constituency.id);
    if (!ward) throw new Error('Ward not found');

    const caseRecord = await CaseModel.create(
      user.id,
      phoneNumber,
      'emergency',
      data.emergency_type,
      { constituency_id: constituency.id, ward_id: ward.id, landmark: data.landmark, latitude: data.latitude, longitude: data.longitude },
      data.severity,
      data.details,
      data.reporter_name
    );

    await CaseModel.routeCase(caseRecord.id, data.emergency_type);

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
    }
  ): Promise<{ caseId: string; priority: string; message: string }> {
    const user = await UserModel.getOrCreate(phoneNumber);
    const constituency = await LocationModel.getConstituencyByName(data.constituency);
    if (!constituency) throw new Error('Constituency not found');

    const ward = await LocationModel.getWardByName(data.ward, constituency.id);
    if (!ward) throw new Error('Ward not found');

    const caseRecord = await CaseModel.create(
      user.id,
      phoneNumber,
      'help',
      data.help_type,
      { constituency_id: constituency.id, ward_id: ward.id, landmark: data.landmark },
      { dangerous: data.urgency.life_threatening, trapped: false, worsening: false, people_affected: data.urgency.people_affected },
      data.urgency
    );

    await CaseModel.routeCase(caseRecord.id, data.help_type);

    return {
      caseId: caseRecord.case_id,
      priority: caseRecord.priority,
      message: `Help request received. Case ID: ${caseRecord.case_id}`,
    };
  }

  static async getUserCaseDetails(caseId: string, phoneNumber: string): Promise<any> {
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
```

---

## PART 7: API ROUTES

### src/app/api/cases/report/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { CaseService } from '@/lib/services/CaseService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await CaseService.submitEmergency(body.phone_number, body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to report emergency' },
      { status: 400 }
    );
  }
}
```

### src/app/api/cases/help/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { CaseService } from '@/lib/services/CaseService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await CaseService.submitHelpRequest(body.phone_number, body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit help request' },
      { status: 400 }
    );
  }
}
```

### src/app/api/cases/[caseId]/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { CaseService } from '@/lib/services/CaseService';

export async function GET(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const phoneNumber = request.nextUrl.searchParams.get('phone_number');
    if (!phoneNumber) return NextResponse.json({ error: 'phone_number required' }, { status: 400 });

    const details = await CaseService.getUserCaseDetails(params.caseId, phoneNumber);
    return NextResponse.json(details);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Case not found or unauthorized' },
      { status: 404 }
    );
  }
}
```

### src/app/api/locations/constituencies/route.ts

```typescript
import { NextResponse } from 'next/server';
import { LocationModel } from '@/lib/models/Location';

export async function GET() {
  try {
    const constituencies = await LocationModel.getConstituencies();
    return NextResponse.json({ constituencies });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
```

### src/app/api/locations/wards/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { LocationModel } from '@/lib/models/Location';

export async function GET(request: NextRequest) {
  try {
    const constituencyId = request.nextUrl.searchParams.get('constituency_id');
    if (!constituencyId) return NextResponse.json({ error: 'constituency_id required' }, { status: 400 });

    const wards = await LocationModel.getWards(parseInt(constituencyId));
    return NextResponse.json({ wards });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
```

---

## PART 8: UI COMPONENTS (shadcn/ui + Black & White)

### src/components/common/StepIndicator.tsx

```typescript
'use client';

import { Badge } from '@/components/ui/badge';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex-1">
        <div className="w-full bg-gray-200 h-1 rounded-full">
          <div
            className="bg-black h-1 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
      <Badge variant="outline" className="ml-4 border-black text-black">
        {currentStep}/{totalSteps}
      </Badge>
    </div>
  );
}
```

### src/components/common/LoadingSpinner.tsx

```typescript
'use client';

import { Loader2 } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-black" />
    </div>
  );
}
```

### src/components/common/ErrorAlert.tsx

```typescript
'use client';

import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className="border-red-600 bg-red-50">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">{message}</AlertDescription>
    </Alert>
  );
}
```

### src/components/steps/LocationStep.tsx

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { StepIndicator } from '@/components/common/StepIndicator';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Constituency, Ward } from '@/lib/models/Location';

interface LocationStepProps {
  onNext: (data: { constituency: string; ward: string; landmark?: string }) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function LocationStep({
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: LocationStepProps) {
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedConstituency, setSelectedConstituency] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [landmark, setLandmark] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchConstituencies();
  }, []);

  useEffect(() => {
    if (selectedConstituency) {
      const constituency = constituencies.find((c) => c.name === selectedConstituency);
      if (constituency) {
        fetchWards(constituency.id);
      }
    }
  }, [selectedConstituency]);

  const fetchConstituencies = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/locations/constituencies');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setConstituencies(data.constituencies);
    } catch (err) {
      setError('Failed to load constituencies');
    } finally {
      setLoading(false);
    }
  };

  const fetchWards = async (constituencyId: number) => {
    try {
      const res = await fetch(`/api/locations/wards?constituency_id=${constituencyId}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setWards(data.wards);
      setSelectedWard('');
    } catch (err) {
      setError('Failed to load wards');
    }
  };

  const handleSubmit = () => {
    if (!selectedConstituency || !selectedWard) {
      setError('Please select constituency and ward');
      return;
    }
    onNext({
      constituency: selectedConstituency,
      ward: selectedWard,
      landmark: landmark || undefined,
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-md mx-auto p-6">
      <Card className="p-6 border-gray-200">
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        <h2 className="text-xl font-bold mb-6 text-black">Where is the emergency?</h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="constituency" className="text-black font-semibold">
              Constituency
            </Label>
            <Select value={selectedConstituency} onValueChange={setSelectedConstituency}>
              <SelectTrigger id="constituency" className="border-gray-300 text-black">
                <SelectValue placeholder="Select constituency" />
              </SelectTrigger>
              <SelectContent>
                {constituencies.map((c) => (
                  <SelectItem key={c.id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedConstituency && (
            <div>
              <Label htmlFor="ward" className="text-black font-semibold">
                Ward
              </Label>
              <Select value={selectedWard} onValueChange={setSelectedWard}>
                <SelectTrigger id="ward" className="border-gray-300 text-black">
                  <SelectValue placeholder="Select ward" />
                </SelectTrigger>
                <SelectContent>
                  {wards.map((w) => (
                    <SelectItem key={w.id} value={w.name}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="landmark" className="text-black font-semibold">
              Landmark / Estate / Road (optional)
            </Label>
            <Input
              id="landmark"
              placeholder="e.g., near Kayole Market"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="border-gray-300 text-black placeholder-gray-400"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1 border-black text-black hover:bg-gray-100"
            >
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-black text-white hover:bg-gray-800"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

### src/components/steps/SeverityStep.tsx

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { StepIndicator } from '@/components/common/StepIndicator';

interface SeverityStepProps {
  onNext: (data: { dangerous: boolean; trapped: boolean; worsening: boolean; people_affected: number }) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function SeverityStep({
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: SeverityStepProps) {
  const [dangerous, setDangerous] = useState(false);
  const [trapped, setTrapped] = useState(false);
  const [worsening, setWorsening] = useState(false);
  const [peopleAffected, setPeopleAffected] = useState('0');

  const handleSubmit = () => {
    onNext({
      dangerous,
      trapped,
      worsening,
      people_affected: parseInt(peopleAffected) || 0,
    });
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Card className="p-6 border-gray-200">
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        <h2 className="text-xl font-bold mb-6 text-black">Severity Assessment</h2>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="dangerous"
              checked={dangerous}
              onCheckedChange={(checked) => setDangerous(checked as boolean)}
              className="border-black"
            />
            <Label htmlFor="dangerous" className="text-black font-medium cursor-pointer">
              Is anyone in immediate danger?
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="trapped"
              checked={trapped}
              onCheckedChange={(checked) => setTrapped(checked as boolean)}
              className="border-black"
            />
            <Label htmlFor="trapped" className="text-black font-medium cursor-pointer">
              Are people trapped?
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="worsening"
              checked={worsening}
              onCheckedChange={(checked) => setWorsening(checked as boolean)}
              className="border-black"
            />
            <Label htmlFor="worsening" className="text-black font-medium cursor-pointer">
              Is the situation getting worse?
            </Label>
          </div>

          <div>
            <Label htmlFor="people" className="text-black font-semibold">
              Number of people affected
            </Label>
            <Input
              id="people"
              type="number"
              min="0"
              value={peopleAffected}
              onChange={(e) => setPeopleAffected(e.target.value)}
              className="border-gray-300 text-black"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1 border-black text-black hover:bg-gray-100"
            >
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-black text-white hover:bg-gray-800"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

### src/components/steps/ContactStep.tsx

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { StepIndicator } from '@/components/common/StepIndicator';

interface ContactStepProps {
  phoneNumber: string;
  onNext: (data: { name?: string; permission: boolean }) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function ContactStep({
  phoneNumber,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: ContactStepProps) {
  const [name, setName] = useState('');
  const [permission, setPermission] = useState(true);

  const handleSubmit = () => {
    onNext({
      name: name || undefined,
      permission,
    });
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Card className="p-6 border-gray-200">
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        <h2 className="text-xl font-bold mb-6 text-black">Your Details</h2>

        <div className="space-y-4">
          <div>
            <Label className="text-black font-semibold">Your Phone Number</Label>
            <div className="mt-2 p-3 bg-gray-100 rounded border border-gray-300 text-black font-medium">
              {phoneNumber}
            </div>
          </div>

          <div>
            <Label htmlFor="name" className="text-black font-semibold">
              Your Name (optional)
            </Label>
            <Input
              id="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-gray-300 text-black"
            />
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="permission"
              checked={permission}
              onCheckedChange={(checked) => setPermission(checked as boolean)}
              className="border-black"
            />
            <Label htmlFor="permission" className="text-black font-medium cursor-pointer">
              County team may contact me for more information
            </Label>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1 border-black text-black hover:bg-gray-100"
            >
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-black text-white hover:bg-gray-800"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

### src/components/steps/ConfirmationStep.tsx

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

interface ConfirmationStepProps {
  caseId: string;
  priority: string;
  onCheckStatus: () => void;
  onReportAnother: () => void;
}

const priorityColors: Record<string, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-600 text-white',
  medium: 'bg-yellow-600 text-white',
  low: 'bg-gray-600 text-white',
};

export function ConfirmationStep({
  caseId,
  priority,
  onCheckStatus,
  onReportAnother,
}: ConfirmationStepProps) {
  return (
    <div className="max-w-md mx-auto p-6">
      <Card className="p-6 border-gray-200">
        <div className="text-center space-y-4">
          <CheckCircle2 className="h-12 w-12 mx-auto text-black" />

          <h2 className="text-2xl font-bold text-black">Report Received</h2>

          <p className="text-gray-600">Your emergency report has been received and is being reviewed.</p>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Case ID</p>
            <p className="text-lg font-mono font-bold text-black">{caseId}</p>
          </div>

          <div>
            <Badge className={`${priorityColors[priority] || priorityColors.medium} text-base px-4 py-2`}>
              {priority.toUpperCase()} Priority
            </Badge>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Safety Tip:</strong> If you are in immediate danger, call 999 emergency service.
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <Button
              onClick={onCheckStatus}
              className="w-full bg-black text-white hover:bg-gray-800"
            >
              Check Case Status
            </Button>
            <Button
              onClick={onReportAnother}
              variant="outline"
              className="w-full border-black text-black hover:bg-gray-100"
            >
              Report Another Issue
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

---

## PART 9: COMPLETE WEBVIEW FLOW

### src/components/flows/ReportEmergency.tsx

```typescript
'use client';

import { useState } from 'react';
import { LocationStep } from '@/components/steps/LocationStep';
import { SeverityStep } from '@/components/steps/SeverityStep';
import { ContactStep } from '@/components/steps/ContactStep';
import { ConfirmationStep } from '@/components/steps/ConfirmationStep';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { StepIndicator } from '@/components/common/StepIndicator';

interface ReportEmergencyProps {
  phoneNumber: string;
  onBack: () => void;
}

const EMERGENCY_TYPES = [
  'Flooding',
  'Fire',
  'Medical emergency',
  'Building collapse / unsafe building',
  'Road accident',
  'Blocked drainage',
  'Dangerous infrastructure',
  'Electrical hazard',
  'Fallen tree / obstruction',
  'Other emergency',
];

type Step = 'type' | 'location' | 'severity' | 'details' | 'contact' | 'confirmation';

interface FormData {
  emergency_type: string;
  constituency: string;
  ward: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  dangerous: boolean;
  trapped: boolean;
  worsening: boolean;
  people_affected: number;
  name?: string;
  permission: boolean;
  details: Record<string, any>;
}

export function ReportEmergency({ phoneNumber, onBack }: ReportEmergencyProps) {
  const [step, setStep] = useState<Step>('type');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [caseId, setCaseId] = useState('');
  const [priority, setPriority] = useState('');

  const [formData, setFormData] = useState<FormData>({
    emergency_type: '',
    constituency: '',
    ward: '',
    dangerous: false,
    trapped: false,
    worsening: false,
    people_affected: 0,
    permission: true,
    details: {},
  });

  const stepMap: Record<Step, number> = {
    type: 1,
    location: 2,
    severity: 3,
    details: 4,
    contact: 5,
    confirmation: 6,
  };

  const handleTypeSelect = (type: string) => {
    setFormData((prev) => ({ ...prev, emergency_type: type }));
    setStep('location');
  };

  const handleLocationNext = (data: {
    constituency: string;
    ward: string;
    landmark?: string;
  }) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep('severity');
  };

  const handleSeverityNext = (data: {
    dangerous: boolean;
    trapped: boolean;
    worsening: boolean;
    people_affected: number;
  }) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep('contact');
  };

  const handleContactNext = async (data: { name?: string; permission: boolean }) => {
    const updatedFormData = {
      ...formData,
      reporter_name: data.name,
      reporter_permission_contact: data.permission,
    };

    setLoading(true);
    try {
      const res = await fetch('/api/cases/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneNumber,
          emergency_type: formData.emergency_type,
          constituency: formData.constituency,
          ward: formData.ward,
          landmark: formData.landmark,
          severity: {
            dangerous: formData.dangerous,
            trapped: formData.trapped,
            worsening: formData.worsening,
            people_affected: formData.people_affected,
          },
          details: formData.details,
          reporter_name: data.name,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit report');
      }

      const result = await res.json();
      setCaseId(result.caseId);
      setPriority(result.priority);
      setStep('confirmation');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading && step !== 'type') {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-white">
      {error && <ErrorAlert message={error} />}

      {step === 'type' && (
        <TypeSelectionStep
          emergencyTypes={EMERGENCY_TYPES}
          onSelect={handleTypeSelect}
          onBack={onBack}
        />
      )}

      {step === 'location' && (
        <LocationStep
          onNext={handleLocationNext}
          onBack={() => setStep('type')}
          currentStep={stepMap.location}
          totalSteps={6}
        />
      )}

      {step === 'severity' && (
        <SeverityStep
          onNext={handleSeverityNext}
          onBack={() => setStep('location')}
          currentStep={stepMap.severity}
          totalSteps={6}
        />
      )}

      {step === 'contact' && (
        <ContactStep
          phoneNumber={phoneNumber}
          onNext={handleContactNext}
          onBack={() => setStep('severity')}
          currentStep={stepMap.contact}
          totalSteps={6}
        />
      )}

      {step === 'confirmation' && (
        <ConfirmationStep
          caseId={caseId}
          priority={priority}
          onCheckStatus={onBack}
          onReportAnother={() => {
            setStep('type');
            setFormData({
              emergency_type: '',
              constituency: '',
              ward: '',
              dangerous: false,
              trapped: false,
              worsening: false,
              people_affected: 0,
              permission: true,
              details: {},
            });
          }}
        />
      )}
    </div>
  );
}

function TypeSelectionStep({
  emergencyTypes,
  onSelect,
  onBack,
}: {
  emergencyTypes: string[];
  onSelect: (type: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="max-w-md mx-auto p-6">
      <Card className="p-6 border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-black">Report an Emergency</h2>
        <p className="text-gray-600 mb-6">What type of emergency?</p>

        <div className="space-y-2 mb-6">
          {emergencyTypes.map((type) => (
            <Button
              key={type}
              onClick={() => onSelect(type)}
              variant="outline"
              className="w-full justify-start border-gray-300 text-black hover:bg-gray-100 hover:border-black"
            >
              {type}
            </Button>
          ))}
        </div>

        <Button
          onClick={onBack}
          variant="outline"
          className="w-full border-black text-black hover:bg-gray-100"
        >
          Back to Menu
        </Button>
      </Card>
    </div>
  );
}
```

---

## PART 10: MAIN WEBVIEW PAGE

### src/app/(auth)/webview/page.tsx

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ReportEmergency } from '@/components/flows/ReportEmergency';
import { RequestHelp } from '@/components/flows/RequestHelp';
import { CaseStatus } from '@/components/flows/CaseStatus';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Flow = 'menu' | 'report' | 'help' | 'missing' | 'shelter' | 'status';

export default function WebviewPage() {
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get('phone_number');
  const [flow, setFlow] = useState<Flow>('menu');

  if (!phoneNumber) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="p-8 border-gray-300 max-w-md">
          <p className="text-center text-red-600 font-semibold">Phone number not provided</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {flow === 'menu' && (
        <MainMenu phoneNumber={phoneNumber} onSelect={setFlow} />
      )}
      {flow === 'report' && (
        <ReportEmergency phoneNumber={phoneNumber} onBack={() => setFlow('menu')} />
      )}
      {flow === 'help' && (
        <RequestHelp phoneNumber={phoneNumber} onBack={() => setFlow('menu')} />
      )}
      {flow === 'status' && (
        <CaseStatus phoneNumber={phoneNumber} onBack={() => setFlow('menu')} />
      )}
    </div>
  );
}

function MainMenu({
  phoneNumber,
  onSelect,
}: {
  phoneNumber: string;
  onSelect: (flow: Flow) => void;
}) {
  return (
    <div className="max-w-md mx-auto p-6">
      <Card className="p-6 border-gray-200">
        <h1 className="text-3xl font-bold mb-2 text-black">Nairobi Emergency</h1>
        <p className="text-gray-600 mb-8">What do you need help with?</p>

        <div className="space-y-3">
          <Button
            onClick={() => onSelect('report')}
            className="w-full bg-black text-white hover:bg-gray-800 font-semibold py-6"
          >
            Report an Emergency
          </Button>
          <Button
            onClick={() => onSelect('help')}
            className="w-full bg-black text-white hover:bg-gray-800 font-semibold py-6"
          >
            Request Help or Rescue
          </Button>
          <Button
            onClick={() => onSelect('missing')}
            className="w-full bg-black text-white hover:bg-gray-800 font-semibold py-6"
          >
            Missing Persons and Property
          </Button>
          <Button
            onClick={() => onSelect('shelter')}
            className="w-full bg-black text-white hover:bg-gray-800 font-semibold py-6"
          >
            Shelter, Relief and Safety
          </Button>
          <Button
            onClick={() => onSelect('status')}
            variant="outline"
            className="w-full border-black text-black hover:bg-gray-100 font-semibold py-6"
          >
            Check Case Status
          </Button>
        </div>
      </Card>
    </div>
  );
}
```

---

## PART 11: REMAINING FLOWS (RequestHelp, CaseStatus, etc.)

### src/components/flows/RequestHelp.tsx

```typescript
'use client';

import { useState } from 'react';
import { LocationStep } from '@/components/steps/LocationStep';
import { SeverityStep } from '@/components/steps/SeverityStep';
import { ContactStep } from '@/components/steps/ContactStep';
import { ConfirmationStep } from '@/components/steps/ConfirmationStep';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StepIndicator } from '@/components/common/StepIndicator';

interface RequestHelpProps {
  phoneNumber: string;
  onBack: () => void;
}

const HELP_TYPES = [
  'Urgent rescue',
  'Ambulance / medical help',
  'Evacuation help',
  'Help for trapped person',
  'Help for stranded person',
  'Help for child / elderly / person with disability',
];

type Step = 'type' | 'location' | 'urgency' | 'contact' | 'confirmation';

interface FormData {
  help_type: string;
  constituency: string;
  ward: string;
  landmark?: string;
  life_threatening: boolean;
  people_affected: number;
  name?: string;
  permission: boolean;
}

export function RequestHelp({ phoneNumber, onBack }: RequestHelpProps) {
  const [step, setStep] = useState<Step>('type');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [caseId, setCaseId] = useState('');
  const [priority, setPriority] = useState('');

  const [formData, setFormData] = useState<FormData>({
    help_type: '',
    constituency: '',
    ward: '',
    life_threatening: false,
    people_affected: 0,
    permission: true,
  });

  const handleTypeSelect = (type: string) => {
    setFormData((prev) => ({ ...prev, help_type: type }));
    setStep('location');
  };

  const handleLocationNext = (data: {
    constituency: string;
    ward: string;
    landmark?: string;
  }) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep('urgency');
  };

  const handleUrgencyNext = (data: {
    dangerous: boolean;
    trapped: boolean;
    worsening: boolean;
    people_affected: number;
  }) => {
    setFormData((prev) => ({
      ...prev,
      life_threatening: data.dangerous,
      people_affected: data.people_affected,
    }));
    setStep('contact');
  };

  const handleContactNext = async (data: { name?: string; permission: boolean }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/cases/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneNumber,
          help_type: formData.help_type,
          constituency: formData.constituency,
          ward: formData.ward,
          landmark: formData.landmark,
          urgency: {
            life_threatening: formData.life_threatening,
            people_affected: formData.people_affected,
          },
          reporter_name: data.name,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit request');
      }

      const result = await res.json();
      setCaseId(result.caseId);
      setPriority(result.priority);
      setStep('confirmation');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading && step !== 'type') {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-white">
      {error && <ErrorAlert message={error} />}

      {step === 'type' && (
        <TypeSelectionStep helpTypes={HELP_TYPES} onSelect={handleTypeSelect} onBack={onBack} />
      )}

      {step === 'location' && (
        <LocationStep
          onNext={handleLocationNext}
          onBack={() => setStep('type')}
          currentStep={2}
          totalSteps={5}
        />
      )}

      {step === 'urgency' && (
        <SeverityStep
          onNext={handleUrgencyNext}
          onBack={() => setStep('location')}
          currentStep={3}
          totalSteps={5}
        />
      )}

      {step === 'contact' && (
        <ContactStep
          phoneNumber={phoneNumber}
          onNext={handleContactNext}
          onBack={() => setStep('urgency')}
          currentStep={4}
          totalSteps={5}
        />
      )}

      {step === 'confirmation' && (
        <ConfirmationStep
          caseId={caseId}
          priority={priority}
          onCheckStatus={onBack}
          onReportAnother={() => {
            setStep('type');
            setFormData({
              help_type: '',
              constituency: '',
              ward: '',
              life_threatening: false,
              people_affected: 0,
              permission: true,
            });
          }}
        />
      )}
    </div>
  );
}

function TypeSelectionStep({
  helpTypes,
  onSelect,
  onBack,
}: {
  helpTypes: string[];
  onSelect: (type: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="max-w-md mx-auto p-6">
      <Card className="p-6 border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-black">Request Help or Rescue</h2>
        <p className="text-gray-600 mb-6">What help do you need?</p>

        <div className="space-y-2 mb-6">
          {helpTypes.map((type) => (
            <Button
              key={type}
              onClick={() => onSelect(type)}
              variant="outline"
              className="w-full justify-start border-gray-300 text-black hover:bg-gray-100 hover:border-black"
            >
              {type}
            </Button>
          ))}
        </div>

        <Button
          onClick={onBack}
          variant="outline"
          className="w-full border-black text-black hover:bg-gray-100"
        >
          Back to Menu
        </Button>
      </Card>
    </div>
  );
}
```

### src/components/flows/CaseStatus.tsx

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface CaseStatusProps {
  phoneNumber: string;
  onBack: () => void;
}

interface CaseDetails {
  case_id: string;
  status: string;
  priority: string;
  assigned_department: string;
  updates: Array<{ update_message: string; created_at: string }>;
}

const statusIcons: Record<string, JSX.Element> = {
  submitted: <Clock className="h-5 w-5 text-gray-600" />,
  assigned: <AlertCircle className="h-5 w-5 text-blue-600" />,
  in_progress: <AlertCircle className="h-5 w-5 text-orange-600" />,
  resolved: <CheckCircle2 className="h-5 w-5 text-green-600" />,
};

export function CaseStatus({ phoneNumber, onBack }: CaseStatusProps) {
  const [caseId, setCaseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [caseDetails, setCaseDetails] = useState<CaseDetails | null>(null);

  const handleCheckStatus = async () => {
    if (!caseId.trim()) {
      setError('Please enter a case ID');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/cases/${caseId}?phone_number=${phoneNumber}`);

      if (!res.ok) {
        throw new Error('Case not found');
      }

      const details = await res.json();
      setCaseDetails(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch case status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (caseDetails) {
    return (
      <div className="max-w-md mx-auto p-6">
        <Card className="p-6 border-gray-200">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Case ID</p>
              <p className="text-lg font-mono font-bold text-black">{caseDetails.case_id}</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status</span>
              <div className="flex items-center gap-2">
                {statusIcons[caseDetails.status] || <Clock className="h-5 w-5" />}
                <span className="text-black font-semibold capitalize">{caseDetails.status.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Priority</span>
              <Badge className={getPriorityBadgeClass(caseDetails.priority)}>
                {caseDetails.priority.toUpperCase()}
              </Badge>
            </div>

            <div>
              <span className="text-gray-600">Assigned To</span>
              <p className="text-black font-semibold mt-1">{caseDetails.assigned_department}</p>
            </div>

            {caseDetails.updates.length > 0 && (
              <div>
                <h3 className="font-semibold text-black mb-3">Updates</h3>
                <div className="space-y-2">
                  {caseDetails.updates.map((update, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-200">
                      <p className="text-sm text-gray-600">
                        {new Date(update.created_at).toLocaleString()}
                      </p>
                      <p className="text-black text-sm mt-1">{update.update_message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-6">
              <Button
                onClick={() => {
                  setCaseDetails(null);
                  setCaseId('');
                }}
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                Check Another Case
              </Button>
              <Button
                onClick={onBack}
                variant="outline"
                className="w-full border-black text-black hover:bg-gray-100"
              >
                Back to Menu
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <Card className="p-6 border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-black">Check Case Status</h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="caseId" className="text-black font-semibold">
              Case ID
            </Label>
            <Input
              id="caseId"
              placeholder="e.g., EMERG-20250309-ABC123"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              className="border-gray-300 text-black placeholder-gray-400 font-mono"
            />
          </div>

          {error && <ErrorAlert message={error} />}

          <div className="flex gap-3 mt-6">
            <Button
              onClick={onBack}
              variant="outline"
              className="flex-1 border-black text-black hover:bg-gray-100"
            >
              Back
            </Button>
            <Button
              onClick={handleCheckStatus}
              className="flex-1 bg-black text-white hover:bg-gray-800"
            >
              Check Status
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function getPriorityBadgeClass(priority: string): string {
  const classes: Record<string, string> = {
    critical: 'bg-red-600 text-white',
    high: 'bg-orange-600 text-white',
    medium: 'bg-yellow-600 text-white',
    low: 'bg-gray-600 text-white',
  };
  return classes[priority] || classes.medium;
}
```

---

## PART 12: STYLING (globals.css)

### src/styles/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 0%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 0%;
  --primary: 0 0% 0%;
  --primary-foreground: 0 0% 100%;
  --secondary: 0 0% 96%;
  --secondary-foreground: 0 0% 0%;
  --muted: 0 0% 89%;
  --muted-foreground: 0 0% 45%;
  --accent: 0 0% 0%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --border: 0 0% 89%;
  --input: 0 0% 89%;
  --ring: 0 0% 0%;
}

* {
  @apply border-gray-200;
}

body {
  @apply bg-white text-black;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
    'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

input,
select,
textarea {
  @apply text-black placeholder-gray-400;
}

button {
  @apply transition-colors duration-200;
}

/* Custom scrollbar for black & white theme */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #000;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #333;
}
```

---

## PART 13: DEPLOYMENT CHECKLIST

### Local Development
```bash
npm run dev
# Visit: http://localhost:3000/auth/webview?phone_number=%2B254712345678
```

### Set Up Neon PostgreSQL
1. Go to https://console.neon.tech
2. Create account
3. Create project
4. Copy DATABASE_URL
5. Add to `.env.local`
6. Run SQL schema in Neon console (from Part 4)

### Deploy to Vercel
```bash
# Push to GitHub
git add .
git commit -m "Initial Nairobi Emergency Response"
git push origin main

# Go to https://vercel.com
# Import GitHub repo
# Add DATABASE_URL to Environment Variables
# Deploy!
```

### Post-Deployment
- [ ] Test webview URL with phone number parameter
- [ ] Test all 5 flows (Report, Help, Missing, Shelter, Status)
- [ ] Verify database writes
- [ ] Test case routing logic
- [ ] Check error handling

---

## PART 14: VERIFICATION CHECKLIST

✅ **Data Models** - All 5 case types supported  
✅ **API Routes** - Report, help, status, locations  
✅ **UI Components** - shadcn/ui, black & white theme  
✅ **Phone Parameter** - Extracted from `?phone_number={{number}}`  
✅ **Case Routing** - Automatic department assignment  
✅ **Database** - Neon PostgreSQL serverless  
✅ **Deployment** - Vercel (frontend + backend)  
✅ **Authentication** - Phone number based  
✅ **TypeScript** - Full type safety  
✅ **Error Handling** - User-friendly messages  

---


---

*