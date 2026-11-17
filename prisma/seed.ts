import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../prisma/generated/client';
import { PermissionIntData } from './initData.json';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({
  connectionString: connectionString,
});
const prisma = new PrismaClient({ adapter });
async function main() {
  for (const permission of PermissionIntData) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: { description: permission.description },
      create: permission,
    });
  }
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
