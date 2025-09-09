// scripts/migrate-roles.ts
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

async function migrateRoles() {
  console.log('🚀 Starting role migration...');
  
  try {
    // 1. Create default roles in new table
    console.log('📝 Creating default roles...');
    for (const roleData of DEFAULT_ROLES) {
      await prisma.roleModel.upsert({
        where: { code: roleData.code },
        update: roleData,
        create: roleData,
      });
      console.log(`✅ Created/Updated role: ${roleData.name}`);
    }

    // 2. Migrate existing RoleAccess to new structure
    console.log('🔄 Migrating role access data...');
    const existingAccess = await prisma.roleAccess.findMany();
    
    for (const access of existingAccess) {
      // Find corresponding role in new table
      const newRole = await prisma.roleModel.findUnique({
        where: { code: access.role }
      });
      
      if (newRole) {
        await prisma.roleAccessNew.upsert({
          where: {
            menu_roleId: {
              menu: access.menu,
              roleId: newRole.id
            }
          },
          update: {},
          create: {
            menu: access.menu,
            roleId: newRole.id,
          }
        });
        console.log(`✅ Migrated access: ${access.menu} -> ${access.role}`);
      }
    }

    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateRoles();
}

export { migrateRoles };
