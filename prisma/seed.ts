
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const constituencies = [
    'Westlands',
    'Dagoretti North',
    'Dagoretti South',
    'Langata',
    'Kibra',
    'Embakasi North',
    'Embakasi South',
    'Embakasi Central',
    'Embakasi East',
    'Makadara',
    'Kamukunji',
    'Starehe',
    'Mathare',
    'Kasarani',
    'Ruaraka',
    'Roysambu',
    'Njiru'
  ];

  for (const name of constituencies) {
    await prisma.constituency.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const embakasiSouth = await prisma.constituency.findUnique({
    where: { name: 'Embakasi South' },
  });

  if (embakasiSouth) {
    const wards = ['Kayole', 'Embakasi', 'Pipeline'];
    for (const name of wards) {
      await prisma.ward.upsert({
        where: {
          name_constituency_id: {
            name,
            constituency_id: embakasiSouth.id,
          },
        },
        update: {},
        create: {
          name,
          constituency_id: embakasiSouth.id,
        },
      });
    }
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
