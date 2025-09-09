// scripts/add-mining-roles.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MINING_ROLES = [
  {
    code: 'op_mining',
    name: 'Operator Mining',
    description: 'Mining equipment operator',
    color: 'info',
    priority: 7,
  },
  {
    code: 'fo_mining',
    name: 'Foreman Mining',
    description: 'Mining field supervisor/foreman',
    color: 'warning',
    priority: 8,
  },
];

async function addMiningRoles() {
  console.log('🚀 Adding Mining Roles...\n');
  
  try {
    for (const roleData of MINING_ROLES) {
      const role = await prisma.roleModel.upsert({
        where: { code: roleData.code },
        update: roleData,
        create: roleData,
      });
      console.log(`✅ Added/Updated: ${role.name} (${role.code})`);
    }

    // Display all roles now
    console.log('\n📋 All available roles:');
    const allRoles = await prisma.roleModel.findMany({
      where: { isActive: true },
      orderBy: [{ priority: "asc" }, { name: "asc" }],
    });
    
    allRoles.forEach(role => {
      console.log(`  ${role.priority}. ${role.name} (${role.code}) - ${role.color}`);
    });

    console.log(`\n🎉 Success! Now you have ${allRoles.length} roles available`);
    console.log('🔥 You can now create users with OpMining and FoMining roles!');

  } catch (error) {
    console.error('❌ Failed to add mining roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMiningRoles();
