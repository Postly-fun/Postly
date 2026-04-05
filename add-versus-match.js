const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Adding inVersusMatch column to Post table...");
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Post" ADD COLUMN "inVersusMatch" BOOLEAN NOT NULL DEFAULT false;`);
    console.log("Success: Added inVersusMatch.");
  } catch (e) {
    console.log("Note: inVersusMatch column might already exist or error: " + e.message);
  }

  console.log("Creating VersusMatch table...");
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "VersusMatch" (
        "id" TEXT NOT NULL,
        "post1Id" TEXT NOT NULL,
        "post2Id" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "poolAmount" DOUBLE PRECISION NOT NULL,
        "expiresAt" TIMESTAMP(3),
        "winnerId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "VersusMatch_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "VersusMatch_post1Id_fkey" FOREIGN KEY ("post1Id") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "VersusMatch_post2Id_fkey" FOREIGN KEY ("post2Id") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "VersusMatch_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);
    console.log("Success: Created VersusMatch table.");
  } catch (e) {
    console.log("Note: VersusMatch table might already exist or error: " + e.message);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
