"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Divider,
} from "@heroui/react";
import { Modal, ModalContent } from "@heroui/react";
import { Power, Save, Shield } from "lucide-react";
import FocusLock from "react-focus-lock";

import { defaultNavItems } from "@/lib/config/navigation";
import { DEFAULT_ROLES } from "@/lib/utils/roleAccess";

type Role =
  | "super_admin"
  | "admin_heavy"
  | "admin_elec"
  | "pengawas"
  | "mekanik"
  | "guest";

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Used for loading state
  const [error, setError] = useState<string | null>(null);

  const [accessConfig, setAccessConfig] = useState<Record<string, string[]>>(
    {},
  ); // Used for access config
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string[]>>(
    {},
  );

  // Format roles untuk tampilan
  const roles = useMemo<RoleItem[]>(() => {
    return DEFAULT_ROLES.map((role, index) => ({
      id: `role-${index}`,
      name: role.charAt(0).toUpperCase() + role.slice(1).replace("_", " "),
      role: role as Role,
    }));
  }, []);

  // Ambil konfigurasi akses dari API
  useEffect(() => {
    const fetchRoleAccessFromAPI = async () => {
      const accessMap: Record<string, string[]> = {};

      defaultNavItems.forEach((item) => {
        accessMap[item.id] = []; // Nilai default
      });
      try {
        setIsLoading(true);
        const res = await fetch("/api/role-access");

        if (!res.ok) throw new Error("Gagal fetch role access");
        const data = await res.json(); // [{menu, role}]

        // Mapping: {menuId: [role, ...]}
        data.forEach((entry: { menu: string; role: string }) => {
          if (!accessMap[entry.menu]) accessMap[entry.menu] = [];
          accessMap[entry.menu].push(entry.role);
        });
        setAccessConfig(accessMap);
        setSelectedRoles(accessMap);
      } catch (error) {
        setError("Gagal memuat konfigurasi akses");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoleAccessFromAPI();
  }, []);

  // Client-side guard (pelengkap middleware) khusus halaman auth
  useEffect(() => {
    if (status !== "authenticated") return;
    if (!session?.user) return;
    // super_admin selalu boleh
    if (session.user.role === "super_admin") return;
    // Tunggu data roleAccess selesai dimuat supaya tidak redirect prematur
    if (isLoading) return;

    const allowedRoles = accessConfig["auth"] || [];

    if (!allowedRoles.includes(session.user.role)) {
      router.replace("/dashboard");
    }
  }, [status, session, accessConfig, isLoading, router]);

  // Handle perubahan centang pada checkbox
  const handleRoleToggle = useCallback(
    (navItemId: string, role: string, checked: boolean) => {
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
          newRoles[navItemId] = newRoles[navItemId].filter(
            (r: string) => r !== role,
          );
        }

        return newRoles;
      });
    },
    [],
  );

  // Simpan perubahan ke backend
  const saveChanges = useCallback(async () => {
    try {
      setIsSaving(true);
      // Kirim perubahan ke API untuk setiap menu
      for (const [navItemId, roles] of Object.entries(selectedRoles)) {
        const validRoles = roles.filter((role): role is Role =>
          DEFAULT_ROLES.includes(role as Role),
        );

        await fetch("/api/role-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ menu: navItemId, roles: validRoles }),
        });
      }
      setShowSuccessModal(true);
      // Refresh data dari API
      const res = await fetch("/api/role-access");
      const data = await res.json();
      const accessMap: Record<string, string[]> = {};

      defaultNavItems.forEach((item) => {
        accessMap[item.id] = [];
      });
      data.forEach((entry: { menu: string; role: string }) => {
        if (!accessMap[entry.menu]) accessMap[entry.menu] = [];
        accessMap[entry.menu].push(entry.role);
      });
      setAccessConfig(accessMap);
      setSelectedRoles(accessMap);
    } catch (error) {
      setError("Gagal menyimpan perubahan");
    } finally {
      setIsSaving(false);
    }
  }, [selectedRoles, defaultNavItems]);

  // Reset ke pengaturan default
  const resetToDefault = useCallback(() => {
    setShowResetModal(true);
  }, []);

  // Reset ke default dan simpan ke backend
  const handleConfirmReset = useCallback(async () => {
    const defaultRoles: Record<string, string[]> = {};

    defaultNavItems.forEach((item) => {
      if ("defaultRoles" in item) {
        defaultRoles[item.id] = [...item.defaultRoles];
      }
      if ("children" in item && item.children) {
        item.children.forEach((child) => {
          if ("defaultRoles" in child) {
            defaultRoles[child.id] = [...child.defaultRoles];
          }
        });
      }
    });
    setSelectedRoles(defaultRoles);
    setAccessConfig(defaultRoles);
    setShowResetModal(false);
    // Simpan ke backend
    for (const [navItemId, roles] of Object.entries(defaultRoles)) {
      await fetch("/api/role-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menu: navItemId, roles }),
      });
    }
  }, [defaultNavItems]);

  // Tampilkan pesan error jika ada
  if (error) {
    return (
      <div className="p-4 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  // Redirect jika bukan admin
  if (status === "unauthenticated" || !session?.user) {
    router.push("/login");

    return null;
  }

  return (
    <div className="p-0 md:p-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
            <Shield className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Authorization
            </h1>
          </div>
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-3 flex-1 justify-start self-start">
            <div className="p-2 bg-default-500 rounded-lg flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col flex-1 text-left">
              <div className="flex items-center gap-2">
                <p className="text-xl font-semibold text-default-800 text-left">
                  All Roles
                </p>
              </div>
              <p className="text-small text-default-600">Roles Authorization</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              className="flex-1 sm:flex-none"
              color="warning"
              size="sm"
              startContent={<Power className="w-4 h-4" />}
              variant="flat"
              onPress={resetToDefault}
            >
              Reset
            </Button>
            <Button
              className="flex-1 sm:flex-none"
              color="success"
              isLoading={isSaving}
              size="sm"
              startContent={<Save className="w-4 h-4" />}
              variant="flat"
              onPress={saveChanges}
            >
              Save
            </Button>
          </div>
          {/* Modal sukses simpan perubahan */}
          <Modal
            isOpen={showSuccessModal}
            placement="top-center"
            onOpenChange={setShowSuccessModal}
          >
            <FocusLock>
              <ModalContent>
                {(onClose) => (
                  <div className="p-6 text-center">
                    <h3 className="text-lg font-semibold mb-2 text-success">
                      Perubahan berhasil disimpan!
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Konfigurasi akses role sudah diperbarui.
                    </p>
                    <Button color="success" onPress={onClose}>
                      Tutup
                    </Button>
                  </div>
                )}
              </ModalContent>
            </FocusLock>
          </Modal>

          {/* Modal konfirmasi reset ke default */}
          <Modal
            isOpen={showResetModal}
            placement="top-center"
            onOpenChange={setShowResetModal}
          >
            <ModalContent>
              {(onClose) => (
                <div className="p-6 text-center">
                  <h3 className="text-lg font-semibold mb-2 text-warning">
                    Reset ke Default?
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Apakah Anda yakin ingin mengembalikan pengaturan ke default?
                    Semua perubahan akses role akan dihapus.
                  </p>
                  <div className="flex justify-center gap-4 mt-4">
                    <Button color="default" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button color="warning" onPress={handleConfirmReset}>
                      Reset
                    </Button>
                  </div>
                </div>
              )}
            </ModalContent>
          </Modal>
        </CardHeader>
        <Divider />
        <CardBody>
          {/* <div className="flex justify-end gap-2 mb-4">
            <Button color="primary" onPress={saveChanges} isLoading={isSaving}>
              Simpan Perubahan
            </Button>
            <Button color="default" onPress={resetToDefault}>
              Reset ke Default
            </Button>
          </div> */}

          <div className="overflow-x-auto">
            <Table
              aria-label="Role access table"
              className="min-w-full"
              selectionMode="none"
            >
              <TableHeader>
                <TableColumn key="menu">MENU</TableColumn>
                <>
                  {roles
                    .filter((r) => r.role !== "super_admin")
                    .map((r) => (
                      <TableColumn
                        key={r.role}
                        className="uppercase text-center"
                      >
                        {r.name}
                      </TableColumn>
                    ))}
                </>
              </TableHeader>
              <TableBody>
                {(() => {
                  const items: any[] = [];

                  defaultNavItems.forEach((item) => {
                    items.push(item);
                    if ("children" in item && Array.isArray(item.children)) {
                      items.push(...item.children);
                    }
                  });

                  return items;
                })().map((item) => (
                  <TableRow key={item.id}>
                    {[
                      <TableCell key="menu">{item.title}</TableCell>,
                      ...roles
                        .filter((r) => r.role !== "super_admin")
                        .map((r) => (
                          <TableCell key={r.role}>
                            <div className="flex justify-center">
                              <Checkbox
                                aria-label={`Akses ${r.name} untuk ${item.title}`}
                                isSelected={
                                  selectedRoles[item.id]?.includes(r.role) ||
                                  false
                                }
                                radius="sm"
                                onValueChange={(checked) =>
                                  handleRoleToggle(item.id, r.role, checked)
                                }
                              />
                            </div>
                          </TableCell>
                        )),
                    ]}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* Modal sukses simpan perubahan */}
      <Modal
        isOpen={showSuccessModal}
        placement="top-center"
        onOpenChange={setShowSuccessModal}
      >
        <FocusLock>
          <ModalContent>
            {(onClose) => (
              <div className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2 text-green-600 dark:text-green-400">
                  Changes saved successfully!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Role access configuration has been updated.
                </p>
                <Button
                  className="bg-green-600 text-white dark:bg-green-500 dark:text-gray-900"
                  color="success"
                  onPress={onClose}
                >
                  Close
                </Button>
                {/* Removed autoFocus for accessibility */}
              </div>
            )}
          </ModalContent>
        </FocusLock>
      </Modal>
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
  if (status === "unauthenticated" || !session?.user) {
    router.push("/login");

    return null;
  }
}
