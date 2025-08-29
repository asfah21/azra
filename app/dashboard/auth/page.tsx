// app/dashboard/auth/page.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button, Card, CardBody, CardHeader, Checkbox, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, ScrollShadow } from "@heroui/react";
import { defaultNavItems } from "@/lib/config/navigation";
import { getRoleAccess, updateRoleAccess, DEFAULT_ROLES } from "@/lib/utils/roleAccess";

type Role = 'super_admin' | 'admin_heavy' | 'admin_elec' | 'pengawas' | 'mekanik' | 'guest';

interface RoleItem {
  id: string;
  name: string;
  role: Role;
}

type NavItem = {
  id: string;
  title: string;
  path: string;
  icon: string;
  defaultRoles: readonly Role[];
};

export default function RoleManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [accessConfig, setAccessConfig] = useState<Record<string, string[]>>({});
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string[]>>({});

  // Format roles untuk tampilan
  const roles = useMemo<RoleItem[]>(() => {
    return DEFAULT_ROLES.map((role, index) => ({
      id: `role-${index}`,
      name: role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' '),
      role: role as Role
    }));
  }, []);

  // Inisialisasi data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        
        // Ambil konfigurasi akses dari localStorage
        const savedAccess = getRoleAccess();
        setAccessConfig(savedAccess);
        
        // Inisialisasi selectedRoles dengan nilai default jika belum ada
        const initialSelectedRoles: Record<string, string[]> = {};
        
        defaultNavItems.forEach((item) => {
          // Konversi defaultRoles dari readonly Role[] ke string[]
          const defaultRoles = Array.isArray(item.defaultRoles) 
            ? [...item.defaultRoles] 
            : [];
            
          initialSelectedRoles[item.id] = savedAccess[item.id] || defaultRoles;
        });
        
        setSelectedRoles(initialSelectedRoles);
      } catch (error) {
        console.error('Error loading role access:', error);
        setError('Gagal memuat konfigurasi akses');
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Handle perubahan centang pada checkbox
  const handleRoleToggle = useCallback((navItemId: string, role: string, checked: boolean) => {
    setSelectedRoles((prev: Record<string, string[]>) => {
      const newRoles = { ...prev };
      
      if (!newRoles[navItemId]) {
        newRoles[navItemId] = [];
      }
      
      if (checked) {
        // Tambahkan role jika belum ada
        if (!newRoles[navItemId].includes(role)) {
          newRoles[navItemId] = [...newRoles[navItemId], role];
        }
      } else {
        // Hapus role jika ada
        newRoles[navItemId] = newRoles[navItemId].filter((r: string) => r !== role);
      }
      
      return newRoles;
    });
  }, []);

  // Simpan perubahan ke localStorage
  const saveChanges = useCallback(() => {
    try {
      setIsSaving(true);
      
      // Simpan ke localStorage
      Object.entries(selectedRoles).forEach(([navItemId, roles]) => {
        // Pastikan roles adalah array of Role
        const validRoles = roles.filter((role): role is Role => 
          DEFAULT_ROLES.includes(role as Role)
        );
        updateRoleAccess(navItemId, validRoles);
      });
      
      // Perbarui state accessConfig
      setAccessConfig(prev => ({
        ...prev,
        ...selectedRoles
      }));
      
      alert('Perubahan berhasil disimpan!');
    } catch (error) {
      console.error('Error saving role access:', error);
      setError('Gagal menyimpan perubahan');
    } finally {
      setIsSaving(false);
    }
  }, [selectedRoles]);

  // Reset ke pengaturan default
  const resetToDefault = useCallback(() => {
    if (confirm('Apakah Anda yakin ingin mengembalikan pengaturan ke default?')) {
      const defaultRoles: Record<string, string[]> = {};
      
      defaultNavItems.forEach((item: NavItem) => {
        defaultRoles[item.id] = [...item.defaultRoles];
        // Hapus dari localStorage untuk menggunakan default
        if (typeof window !== 'undefined') {
          localStorage.removeItem('roleAccess');
        }
      });
      
      setSelectedRoles(defaultRoles);
      setAccessConfig({});
    }
  }, []);

  // Tampilkan loading spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Tampilkan pesan error jika ada
  if (error) {
    return (
      <div className="p-4 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  // Redirect jika bukan admin
  if (status === 'unauthenticated' || !session?.user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Kelola Akses Role</h2>
        </CardHeader>
        <p className="pl-4 text-sm text-gray-500">
            Atur hak akses untuk setiap menu berdasarkan role
          </p>
        <CardBody>
          <div className="flex justify-end gap-2 mb-4">
            <Button color="primary" onPress={saveChanges} isLoading={isSaving}>
              Simpan Perubahan
            </Button>
            <Button color="default" onPress={resetToDefault}>
              Reset ke Default
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Menu
                  </th>
                  {roles.map(role => (
                    <th key={role.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {role.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                {defaultNavItems.map(item => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.title}
                      </div>
                    </td>
                    {roles.map(role => (
                      <td key={`${item.id}-${role.role}`} className="px-6 py-4 whitespace-nowrap">
                        <div className="flex justify-center">
                          <Checkbox
                            isSelected={selectedRoles[item.id]?.includes(role.role)}
                            onValueChange={(checked) => handleRoleToggle(item.id, role.role, checked)}
                            isDisabled={role.role === 'super_admin'}
                            aria-label={`Akses ${role.name} untuk ${item.title}`}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  // Tampilkan pesan error jika ada
  if (error) {
    return (
      <div className="p-4 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  // Redirect jika bukan admin
  if (status === 'unauthenticated' || !session?.user) {
    router.push('/login');
    return null;
  }
}