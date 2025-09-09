// Test script untuk API roles
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testRoleAPI() {
  console.log('🧪 Testing Role API...');
  
  try {
    // Test fetch all roles
    console.log('\n📋 Fetching all roles:');
    const roles = await prisma.roleModel.findMany({
      where: { isActive: true },
      orderBy: [{ priority: "asc" }, { name: "asc" }],
    });
    
    console.log(`Found ${roles.length} roles:`);
    roles.forEach(role => {
      console.log(`  - ${role.name} (${role.code}) - Priority: ${role.priority}`);
    });

    // Test create new role
    console.log('\n🆕 Testing create new role:');
    const newRole = await prisma.roleModel.create({
      data: {
        code: 'op_mining',
        name: 'Operator Mining',
        description: 'Mining equipment operator',
        color: 'info',
        priority: 7,
      }
    });
    console.log(`✅ Created: ${newRole.name} (${newRole.code})`);

    // Test update role
    console.log('\n✏️ Testing update role:');
    const updatedRole = await prisma.roleModel.update({
      where: { id: newRole.id },
      data: {
        description: 'Heavy mining equipment operator',
        priority: 8,
      }
    });
    console.log(`✅ Updated: ${updatedRole.name} - ${updatedRole.description}`);

    // Test soft delete
    console.log('\n🗑️ Testing soft delete:');
    await prisma.roleModel.update({
      where: { id: newRole.id },
      data: { isActive: false }
    });
    console.log(`✅ Soft deleted: ${newRole.name}`);

    console.log('\n🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRoleAPI();
