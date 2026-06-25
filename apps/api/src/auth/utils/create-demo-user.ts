import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { Pool, type PoolConfig } from 'pg';

const DEMO_EMAIL = 'pm@deliveryops.local';
const DEMO_PASSWORD = 'DeliveryOps123!';
const DEMO_NAME = 'Demo PM';

async function createDemoUser(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const poolConfig: PoolConfig = { connectionString };
  const pool = new Pool(poolConfig);
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const passwordHash = await argon2.hash(DEMO_PASSWORD);

    const user = await prisma.user.upsert({
      where: { email: DEMO_EMAIL },
      create: {
        email: DEMO_EMAIL,
        name: DEMO_NAME,
        passwordHash,
      },
      update: {
        name: DEMO_NAME,
        passwordHash,
      },
    });

    console.log(`Demo user ready: ${user.email} (${user.id})`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

createDemoUser().catch((error: unknown) => {
  console.error('Failed to create demo user:', error);
  process.exit(1);
});
