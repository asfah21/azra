// scripts/test-server-actions.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testServerActions() {
  console.log('🧪 Testing Server Actions Logic...\n');
  
  try {
    // Test role model operations (simulating server actions logic)
    console.log('📋 Testing roleModel operations:');
    
    // Test findMany
    const roles = await prisma.roleModel.findMany({
      where: { isActive: true },
      orderBy: [{ priority: "asc" }, { name: "asc" }],
    });
    console.log(`✅ findMany - Found ${roles.length} active roles`);

    // Test findUnique
    const superAdmin = await prisma.roleModel.findUnique({
      where: { code: 'super_admin' }
    });
    console.log(`✅ findUnique - Found super_admin: ${superAdmin?.name}`);

    // Test create new role
    const testRole = await prisma.roleModel.create({
      data: {
        code: 'test_action_role',
        name: 'Test Action Role',
        description: 'Testing server actions',
        color: 'warning',
        priority: 100,
      }
    });
    console.log(`✅ create - Created: ${testRole.name} (${testRole.code})`);

    // Test update
    const updatedRole = await prisma.roleModel.update({
      where: { id: testRole.id },
      data: {
        description: 'Updated description for testing',
        priority: 101,
      }
    });
    console.log(`✅ update - Updated: ${updatedRole.name}`);

    // Test soft delete
    await prisma.roleModel.update({
      where: { id: testRole.id },
      data: { isActive: false }
    });
    console.log(`✅ soft delete - Deactivated: ${testRole.name}`);

    // Clean up - hard delete test role
    await prisma.roleModel.delete({
      where: { id: testRole.id }
    });
    console.log(`🗑️ cleanup - Removed test role`);

    console.log('\n🎉 All server action operations working correctly!');

  } catch (error) {
    console.error('❌ Server action test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testServerActions();
