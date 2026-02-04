import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function updateMultipleJabatan() {
  try {
    // Mapping FID ke Jabatan baru
    const updates = [
      { fid: 630, jabatan: 'SPV IT' },
      { fid: 631, jabatan: 'Supt. SCM' },
      // { fid: 265, jabatan: 'PJO' },
      // Tambahkan FID lain di sini...
    ];

    console.log(`\n📊 Starting update for ${updates.length} users...`);
    console.log('─'.repeat(70));

    let successCount = 0;
    let errorCount = 0;

    for (const { fid, jabatan } of updates) {
      try {
        const user = await prisma.user.findFirst({
          where: { fid: fid },
          select: { fid: true, name: true, jabatan: true }
        });

        if (!user) {
          console.log(`⚠ FID ${fid.toString().padStart(3)} → User tidak ditemukan`);
          errorCount++;
          continue;
        }

        await prisma.user.update({
          where: { fid: fid },
          data: { jabatan: jabatan }
        });

        console.log(`✓ FID ${fid.toString().padStart(3)} → ${user.name?.padEnd(25)} → ${jabatan}`);
        successCount++;
      } catch (err) {
        console.log(`✗ FID ${fid.toString().padStart(3)} → Error: ${err.message}`);
        errorCount++;
      }
    }

    console.log('─'.repeat(70));
    console.log(`\n🎉 Update selesai!`);
    console.log(`   ✓ Success: ${successCount}`);
    console.log(`   ✗ Failed : ${errorCount}`);
    console.log(`   📋 Total  : ${updates.length}\n`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error('\nStack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateMultipleJabatan();
