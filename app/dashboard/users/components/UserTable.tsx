"use client";

import {
  Modal,
  ModalContent,
  useDisclosure,
  Input,
  Pagination,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Chip,
  Button,
  User,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  Users,
  UserPlus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Search,
  ChevronUp,
  ChevronDown,
  Upload,
  Download,
  ImageUp,
} from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import { addToast } from "@heroui/react";

import { AddUserForms } from "./AddUserForm";
import UserDetailModal from "./UserDetailModal";
import { EditUserModal } from "./EditUserModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { ImportUserModal } from "./ImportUserModal";
import AdminChangeUserPhotoModal from "./AdminChangeUserPhotoModal";

import { useUpdateUserPhoto } from "@/hooks/useAdminUsers";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  jabatan?: string | null;
  createdAt: Date;
  lastActive: Date | null;
  photo?: string;
  fid?: string | number | null;
  nik?: string | number | null;
}

interface UserManagementClientProps {
  usersTable: User[];
}

export default function UserTables({ usersTable }: UserManagementClientProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onOpenChange: onDetailOpenChange,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onOpenChange: onEditOpenChange,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure();
  const {
    isOpen: isImportOpen,
    onOpen: onImportOpen,
    onOpenChange: onImportOpenChange,
  } = useDisclosure();
  const {
    isOpen: isAdminPhotoOpen,
    onOpen: onAdminPhotoOpen,
    onOpenChange: onAdminPhotoOpenChange,
  } = useDisclosure();
  const router = useRouter();
  const { data: session } = useSession();

  // State untuk pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // State untuk search
  const [searchQuery, setSearchQuery] = useState("");

  // State untuk selected user
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // State untuk memaksa re-render setiap detik
  const [, setForceUpdate] = useState(0);

  // State untuk sorting
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const updateUserPhotoMutation = useUpdateUserPhoto();

  // Effect untuk update realtime setiap detik
  useEffect(() => {
    const interval = setInterval(() => {
      setForceUpdate((prev) => prev + 1);
    }, 1000); // Update setiap 1 detik

    return () => clearInterval(interval);
  }, []);

  // Label yang akan ditampilkan - memoized
  const getRoleLabel = useCallback((role: string): string => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "pengawas":
        return "Foreman";
      case "mekanik":
        return "Mekanik";
      case "admin_heavy":
        return "Admin PAM";
      case "admin_elec":
        return "Admin";
      default:
        return role;
    }
  }, []);

  const handleUserAdded = () => {
    // Refresh halaman untuk update data setelah user ditambah
    router.refresh();
    onOpenChange();
  };

  const handleUserUpdated = () => {
    // Refresh halaman untuk update data setelah user diupdate
    router.refresh();
    onEditOpenChange();
  };

  // Handler untuk membuka modal detail user
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    onDetailOpen();
  };

  // Handler untuk membuka modal edit user
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    onEditOpen();
  };

  // Handler untuk membuka modal delete user dengan validasi role
  const handleDeleteUser = (user: User) => {
    // Selalu buka modal, biarkan validasi error ditampilkan di dalam modal
    setSelectedUser(user);
    onDeleteOpen();
  };

  const handleUserDeleted = () => {
    // Refresh halaman untuk update data setelah user dihapus
    router.refresh();
    onDeleteOpenChange();
  };

  // Filter data berdasarkan search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return usersTable;
    }

    const query = searchQuery.toLowerCase();

    return usersTable.filter((user) => {
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query) ||
        user.department?.toLowerCase().includes(query) ||
        getRoleLabel(user.role).toLowerCase().includes(query)
      );
    });
  }, [usersTable, searchQuery, getRoleLabel]);

  // Hitung data yang akan ditampilkan berdasarkan halaman
  const pages = Math.ceil(filteredData.length / rowsPerPage);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Callback untuk import complete
  const handleUsersImported = useCallback(() => {
    // Refresh the user list after import
    router.refresh();
    onImportOpenChange();
  }, [router, onImportOpenChange]);

  const SortIcon = ({
    active,
    direction,
  }: {
    active: boolean;
    direction: "asc" | "desc";
  }) => (
    <span
      style={{ marginLeft: 4, display: "inline-flex", verticalAlign: "middle" }}
    >
      {active ? (
        direction === "asc" ? (
          <ChevronUp size={16} />
        ) : (
          <ChevronDown size={16} />
        )
      ) : (
        <ChevronDown size={16} style={{ opacity: 0.5 }} />
      )}
    </span>
  );

  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    const sorted = [...filteredData].sort((a, b) => {
      let aValue = a[sortColumn as keyof User];
      let bValue = b[sortColumn as keyof User];

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === "asc"
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    return sorted;
  }, [filteredData, sortColumn, sortDirection]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return sortedData.slice(start, end);
  }, [page, sortedData]);

  // Reset page ketika search berubah
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1); // Reset ke halaman pertama ketika search berubah
  };

  const getRoleColor = useCallback((role: string) => {
    switch (role) {
      case "admin_elec":
        return "danger";
      case "admin_heavy":
        return "warning";
      case "pengawas":
        return "secondary";
      case "mekanik":
        return "primary";
      case "super_admin":
        return "success";
      default:
        return "default";
    }
  }, []);

  // Tambahkan fungsi untuk menentukan status berdasarkan lastActive
  const getUserStatus = useCallback((lastActive: Date | null): string => {
    if (!lastActive) return "offline";

    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - lastActive.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 15) return "online";

    return "offline";
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "online":
        return "success";
      case "offline":
        return "default";
      default:
        return "default";
    }
  }, []);

  // Tambahkan fungsi untuk format waktu last active dengan emoji dan warna - memoized
  const formatLastActive = useCallback(
    (
      lastActive: Date | null,
    ): { text: string; color: string; emoji: string } => {
      if (!lastActive) return { text: "Never", color: "default", emoji: "❌" };

      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - lastActive.getTime()) / (1000 * 60),
      );
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInMinutes < 1)
        return { text: "Just now", color: "success", emoji: "✅" };
      if (diffInMinutes < 60)
        return { text: `${diffInMinutes}m ago`, color: "primary", emoji: "⏰" };
      if (diffInHours < 24)
        return { text: `${diffInHours}h ago`, color: "warning", emoji: "⚠️" };
      if (diffInDays < 7)
        return { text: `${diffInDays}d ago`, color: "danger", emoji: "🔴" };

      return {
        text: lastActive.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        color: "default",
        emoji: "📅",
      };
    },
    [],
  );

  // Fungsi untuk export data ke Excel
  const handleExportToExcel = useCallback(() => {
    // Buat map untuk users lookup
    const usersMap = new Map(usersTable.map((user) => [user.id, user.name]));

    // Siapkan data untuk export
    const exportData = filteredData.map((user, index) => ({
      No: index + 1, // Menambahkan nomor urut mulai dari 1
      // "User ID": user.id,
      NIK: Number(user.nik),
      Name: user.name,
      Email: user.email,
      Role: user.role,
      Department: user.department,
      Jabatan: user.jabatan,
      FID: Number(user.fid),
      // "Last Active": formatLastActive(user.lastActive).text,
      // "Photo": user.photo,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);

    const columnWidths = [
      { wch: 5 }, // No
      { wch: 9 }, // NIK
      { wch: 30 }, // Name
      { wch: 25 }, // Email
      { wch: 15 }, // Role
      { wch: 12 }, // Department
      { wch: 12 }, // Jabatan
      { wch: 12 }, // FID
    ];

    ws["!cols"] = columnWidths;

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Users");

    // Generate nama file dengan timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const fileName = `users_${timestamp}.xlsx`;

    // Download file
    XLSX.writeFile(wb, fileName);
  }, [filteredData, usersTable, formatLastActive]);

  const handleAdminUpload = async (file: File) => {
    if (!selectedUser) return;
    if (file.size > 1024 * 1024) {
      addToast({
        title: "Ukuran gambar terlalu besar",
        description: "Ukuran gambar maksimal 1MB.",
        color: "danger",
      });

      return;
    }
    const res = await updateUserPhotoMutation.mutateAsync({
      userId: selectedUser.id,
      photo: file,
    });

    if (res?.success) {
      addToast({
        title: "Berhasil",
        description: res.message || "Foto user berhasil diupdate.",
        color: "success",
      });
      router.refresh();
      onAdminPhotoOpenChange();
    } else {
      addToast({
        title: "Gagal",
        description: res?.message || "Gagal mengupdate foto user.",
        color: "danger",
      });
    }
  };

  // Handler untuk membuka modal change photo (admin)
  const handleChangeUserPhoto = (user: User) => {
    setSelectedUser(user);
    onAdminPhotoOpen();
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-3 flex-1 justify-start self-start">
            <div className="p-2 bg-default-500 rounded-lg flex-shrink-0">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <p className="text-xl font-semibold text-default-800 text-left">
                All Users
              </p>
              <p className="text-xs sm:text-small text-default-600">
                Complete user management
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Input
              className="hidden sm:flex w-64"
              placeholder="Search users..."
              size="sm"
              startContent={<Search className="w-4 h-4 text-default-400" />}
              style={{ outline: "none" }}
              value={searchQuery}
              variant="flat"
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                e.target.style.outline = "none";
              }}
              onValueChange={handleSearchChange}
            />

            <Button
              className="flex-1 sm:flex-none"
              color="success"
              size="sm"
              startContent={<Upload className="w-4 h-4" />}
              variant="flat"
              onPress={handleExportToExcel}
            >
              Export
            </Button>

            {session?.user?.role === "super_admin" ? (
              <Button
                className="flex-1 sm:flex-none"
                color="warning"
                size="sm"
                startContent={<Download className="w-4 h-4" />}
                variant="flat"
                onPress={onImportOpen}
              >
                Import
              </Button>
            ) : null}
            {/* <Button
              className="flex-1 sm:flex-none"
              color="default"
              size="sm"
              startContent={<Filter className="w-4 h-4" />}
              variant="flat"
            >
              Filter
            </Button> */}
            {session?.user?.role === "super_admin" ? (
              <Button
                className="flex-1 sm:flex-none"
                color="primary"
                size="sm"
                startContent={<UserPlus className="w-4 h-4" />}
                onPress={onOpen}
              >
                Add User
              </Button>
            ) : null}
            {/* <Button
              className="flex-1 sm:flex-none"
              color="primary"
              size="sm"
              startContent={<UserPlus className="w-4 h-4" />}
              onPress={onOpen}
            >
              Add User
            </Button> */}
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-0">
          {/* Search input untuk mobile */}
          <div className="px-6 pb-4 sm:hidden">
            <Input
              placeholder="Search users..."
              size="sm"
              startContent={<Search className="w-4 h-4 text-default-400" />}
              style={{ outline: "none" }}
              value={searchQuery}
              variant="flat"
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                e.target.style.outline = "none";
              }}
              onValueChange={handleSearchChange}
            />
          </div>
          <div className="overflow-x-auto">
            <Table
              aria-label="Users table"
              bottomContent={
                <div className="flex w-full justify-center">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={pages}
                    onChange={(page) => setPage(page)}
                  />
                </div>
              }
            >
              <TableHeader>
                <TableColumn
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("name")}
                >
                  USER
                  <SortIcon
                    active={sortColumn === "name"}
                    direction={sortDirection}
                  />
                </TableColumn>
                <TableColumn
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("fid")}
                >
                  FID
                  <SortIcon
                    active={sortColumn === "fid"}
                    direction={sortDirection}
                  />
                </TableColumn>
                <TableColumn
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("role")}
                >
                  ROLE
                  <SortIcon
                    active={sortColumn === "role"}
                    direction={sortDirection}
                  />
                </TableColumn>
                <TableColumn
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("department")}
                >
                  DEPARTMENT
                  <SortIcon
                    active={sortColumn === "department"}
                    direction={sortDirection}
                  />
                </TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("lastActive")}
                >
                  LAST ACTIVE
                  <SortIcon
                    active={sortColumn === "lastActive"}
                    direction={sortDirection}
                  />
                </TableColumn>
                <TableColumn
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("createdAt")}
                >
                  JOINED
                  <SortIcon
                    active={sortColumn === "createdAt"}
                    direction={sortDirection}
                  />
                </TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {items.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <User
                        avatarProps={{
                          radius: "lg",
                          src: user.photo,
                          className:
                            "w-8 h-8 rounded-full object-cover flex-shrink-0",
                        }}
                        classNames={{
                          description: "text-default-500",
                        }}
                        description={user.email}
                        name={user.name}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="text-small">
                        <p className="font-medium">
                          {user.fid != null && user.fid !== "null"
                            ? String(user.fid)
                            : "-"}
                        </p>
                        <p className="text-xs text-default-500 mt-0.5">
                          {user.nik != null && user.nik !== "null"
                            ? String(user.nik)
                            : ""}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Chip
                        color={getRoleColor(user.role) as any}
                        size="sm"
                        variant="flat"
                      >
                        {getRoleLabel(user.role)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="text-small">
                        <p className="font-medium">{user.department}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        classNames={{
                          content:
                            getUserStatus(user.lastActive) === "online"
                              ? "text-success-600 font-medium"
                              : "",
                        }}
                        color={
                          getStatusColor(getUserStatus(user.lastActive)) as any
                        }
                        size="sm"
                        variant="dot"
                      >
                        {getUserStatus(user.lastActive)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={formatLastActive(user.lastActive).color as any}
                        size="sm"
                        startContent={
                          <span>{formatLastActive(user.lastActive).emoji}</span>
                        }
                        variant="flat"
                      >
                        {formatLastActive(user.lastActive).text}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="text-small">
                        {new Date(user.createdAt).toLocaleDateString("id-ID")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="relative flex items-center gap-2">
                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu>
                            <DropdownItem
                              key="view"
                              startContent={<Eye className="w-4 h-4" />}
                              onPress={() => handleViewUser(user)}
                            >
                              View Details
                            </DropdownItem>
                            {session?.user?.role === "super_admin" ? (
                              <>
                                <DropdownItem
                                  key="edit"
                                  startContent={<Edit className="w-4 h-4" />}
                                  onPress={() => handleEditUser(user)}
                                >
                                  Edit User
                                </DropdownItem>
                                <DropdownItem
                                  key="photo"
                                  className="text-blue-600"
                                  color="primary"
                                  startContent={<ImageUp className="w-4 h-4" />}
                                  // startContent={
                                  //   <Avatar
                                  //     src={user.photo || undefined}
                                  //     radius="full"
                                  //     className="w-4 h-4"
                                  //   />
                                  // }
                                  onPress={() => handleChangeUserPhoto(user)}
                                >
                                  Change Photo
                                </DropdownItem>
                              </>
                            ) : null}
                            {/* <DropdownItem
                              key="contact"
                              startContent={<Mail className="w-4 h-4" />}
                            >
                              Contact
                            </DropdownItem> */}
                            {session?.user?.role === "super_admin" ? (
                              <DropdownItem
                                key="delete"
                                className="text-danger"
                                color="danger"
                                startContent={<Trash2 className="w-4 h-4" />}
                                onPress={() => handleDeleteUser(user)}
                              >
                                Delete
                              </DropdownItem>
                            ) : null}
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* Modal Add User - always rendered */}
      <div className="mx-4">
        <Modal
          isDismissable={false}
          isOpen={isOpen}
          placement="top-center"
          size="2xl"
          onOpenChange={onOpenChange}
        >
          <ModalContent>
            {(onClose) => (
              <AddUserForms onClose={onClose} onUserAdded={handleUserAdded} />
            )}
          </ModalContent>
        </Modal>
      </div>

      {/* Modal Detail User - always rendered */}
      <UserDetailModal
        isOpen={isDetailOpen}
        user={selectedUser}
        onClose={onDetailOpenChange}
      />

      {/* Modal Edit User - always rendered */}
      <div className="mx-4">
        <Modal
          isOpen={isEditOpen}
          placement="top-center"
          size="2xl"
          onOpenChange={onEditOpenChange}
        >
          <ModalContent>
            {(onClose) => (
              <EditUserModal
                user={selectedUser}
                onClose={onClose}
                onUserUpdated={handleUserUpdated}
              />
            )}
          </ModalContent>
        </Modal>
      </div>

      {/* Modal Delete User - always rendered */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        user={selectedUser}
        onClose={onDeleteOpenChange}
        onUserDeleted={handleUserDeleted}
      />

      {/* Modal Import Asset - always rendered */}
      <div className="mx-4">
        <Modal
          isOpen={isImportOpen}
          placement="top-center"
          size="4xl"
          onOpenChange={onImportOpenChange}
        >
          <ModalContent>
            {(onClose) => (
              <ImportUserModal
                users={
                  selectedUser
                    ? [{ id: selectedUser.id, name: selectedUser.name }]
                    : []
                }
                onClose={onClose}
                onUsersImported={handleUsersImported}
              />
            )}
          </ModalContent>
        </Modal>
      </div>

      {/* Modal Change User Photo - always rendered */}
      <div className="mx-4">
        <Modal
          isOpen={isAdminPhotoOpen}
          placement="top-center"
          size="md"
          onOpenChange={onAdminPhotoOpenChange}
        >
          <ModalContent>
            {(onClose) => (
              <AdminChangeUserPhotoModal
                user={selectedUser}
                onClose={onClose}
                onUpload={handleAdminUpload}
              />
            )}
          </ModalContent>
        </Modal>
      </div>
    </>
  );
}
