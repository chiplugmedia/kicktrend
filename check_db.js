const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const postCols = await prisma.$queryRawUnsafe(`SHOW COLUMNS FROM Post;`);
    const postColNames = postCols.map(c => c.Field);
    console.log('Post columns:', postColNames);

    if (!postColNames.includes('status')) {
      await prisma.$executeRawUnsafe("ALTER TABLE `Post` ADD COLUMN `status` VARCHAR(50) NOT NULL DEFAULT 'approved';");
      console.log('Added column status to Post');
    }
    if (!postColNames.includes('rejectionReason')) {
      await prisma.$executeRawUnsafe("ALTER TABLE `Post` ADD COLUMN `rejectionReason` TEXT DEFAULT NULL;");
      console.log('Added column rejectionReason to Post');
    }

    const updatedCols = await prisma.$queryRawUnsafe(`SHOW COLUMNS FROM Post;`);
    console.log('Updated Post columns:', updatedCols.map(c => c.Field));
  } catch (err) {
    console.error('DB error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
