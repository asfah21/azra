// scripts/seed-roles.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_ROLES = [
  {
    code: 'super_admin',
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    color: 'success',
    priority: 1,
  },
  {
    code: 'admin_heavy',
    name: 'Admin Heavy Equipment',
    description: 'Administrator for heavy equipment division',
    color: 'warning',
    priority: 2,
  },
  {
    code: 'admin_elec',
    name: 'Admin Electrical',
    description: 'Administrator for electrical division',
    color: 'danger',
    priority: 3,
  },
  {
    code: 'pengawas',
    name: 'Foreman',
    description: 'Field supervisor/foreman',
    color: 'secondary',
    priority: 4,
  },
  {
    code: 'mekanik',
    name: 'Technician',
    description: 'Technician/mechanic',
    color: 'primary',
    priority: 5,
  },
  {
    code: 'guest',
    name: 'Guest',
    description: 'Limited read-only access',
    color: 'default',
    priority: 6,
  },
];

async function seedRoles() {
  console.log('🚀 Starting role seeding...');
  
  try {
    // 1. Create default roles in new table
    console.log('📝 Creating default roles...');
    for (const roleData of DEFAULT_ROLES) {
      const role = await prisma.roleModel.upsert({
        where: { code: roleData.code },
        update: roleData,
        create: roleData,
      });
      console.log(`✅ Created/Updated role: ${role.name} (${role.code})`);
    }

    console.log('🎉 Role seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding
seedRoles();
