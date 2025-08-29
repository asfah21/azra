'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { navItems as originalNavItems, roles } from '@/lib/config/navigation';
import { prisma } from '@/lib/prisma';

// Tipe data untuk memastikan konsistensi
interface NavItem {
  id: string;
  title: string;
  path: string;
  icon: string;
  roles: string[];
}

/**
 * Memperbarui file konfigurasi navigasi dengan hak akses role yang baru.
 * @param newRoleAccess Objek yang memetakan roleId ke array nav item ID.
 */
export async function updateRoleAccess(newRoleAccess: Record<string, string[]>) {
  try {
    const updatedNavItems: NavItem[] = JSON.parse(JSON.stringify(originalNavItems));

    // Update roles untuk setiap item navigasi
    updatedNavItems.forEach(item => {
      item.roles = Object.entries(newRoleAccess)
        .filter(([roleId, items]) => items.includes(item.id))
        .map(([roleId]) => roleId);
    });

    // Format file content dengan proper formatting
    const fileContent = `// This file is auto-generated. Do not edit manually.
export const navItems = ${JSON.stringify(updatedNavItems, null, 2)} as const;

export const roles = ${JSON.stringify(roles, null, 2)} as const;
`;

    // Use a more robust path
    const filePath = path.resolve(process.cwd(), 'lib', 'config', 'navigation.ts');

    try {
      await fs.writeFile(filePath, fileContent, 'utf8');
    } catch (writeError) {
      console.error('Failed to write navigation file:', writeError);
      return { 
        success: false, 
        message: `Gagal menulis file navigasi: ${writeError instanceof Error ? writeError.message : 'Unknown error'}` 
      };
    }

    return { 
      success: true, 
      message: 'Hak akses berhasil diperbarui.' 
    };

  } catch (error) {
    console.error('Gagal memperbarui konfigurasi navigasi:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan perubahan.' 
    };
  }
}

export async function getRolesFromDb() {
  try {
    const dbRoles = await prisma.user.findMany({
      select: { 
        id: true, 
        role: true 
      },
      orderBy: {
        role: 'asc'
      }
    });
    
    if (!dbRoles.length) {
      throw new Error('Tidak ada data role yang ditemukan');
    }
    
    return dbRoles;
  } catch (error) {
    console.error('Error fetching roles:', error);
    return []; // Return empty array instead of re-throwing
  }
}
