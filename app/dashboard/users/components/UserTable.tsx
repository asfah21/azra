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
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Search,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";

import { AddUserForms } from "./AddUserForm";
import UserDetailModal from "./UserDetailModal";
import { EditUserModal } from "./EditUserModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  createdAt: Date;
  lastActive: Date | null;
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

  // Effect untuk update realtime setiap detik
  useEffect(() => {
    const interval = setInterval(() => {
      setForceUpdate((prev) => prev + 1);
    }, 1000); // Update setiap 1 detik

    return () => clearInterval(interval);
  }, []);

  // Label yang akan ditampilkan - pindahkan ke atas sebelum useMemo
  const getRoleLabel = (role: string): string => {
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
  };

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
  }, [usersTable, searchQuery]);

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

  const getRoleColor = (role: string) => {
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
  };

  // Tambahkan fungsi untuk menentukan status berdasarkan lastActive
  const getUserStatus = (lastActive: Date | null): string => {
    if (!lastActive) return "offline";

    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - lastActive.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 15) return "online";

    return "offline";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "success";
      case "offline":
        return "default";
      default:
        return "default";
    }
  };

  // Tambahkan fungsi untuk format waktu last active dengan emoji dan warna
  const formatLastActive = (
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
              value={searchQuery}
              variant="flat"
              onValueChange={handleSearchChange}
            />
            <Button
              className="flex-1 sm:flex-none"
              color="default"
              size="sm"
              startContent={<Filter className="w-4 h-4" />}
              variant="flat"
            >
              Filter
            </Button>
            <Button
              className="flex-1 sm:flex-none"
              color="primary"
              size="sm"
              startContent={<UserPlus className="w-4 h-4" />}
              onPress={onOpen}
            >
              Add User
            </Button>
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
              value={searchQuery}
              variant="flat"
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
                          // src: user.avatar,
                          size: "sm",
                        }}
                        classNames={{
                          description: "text-default-500",
                        }}
                        description={user.email}
                        name={user.name}
                      />
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
                              <DropdownItem
                                key="edit"
                                startContent={<Edit className="w-4 h-4" />}
                                onPress={() => handleEditUser(user)}
                              >
                                Edit User
                              </DropdownItem>
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

      {/* Modal Add User */}
      <div className="mx-4">
        <Modal
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

      {/* Modal Detail User */}
      <UserDetailModal
        isOpen={isDetailOpen}
        user={selectedUser}
        onClose={onDetailOpenChange}
      />

      {/* Modal Edit User */}
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

      {/* Modal Delete User */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        user={selectedUser}
        onClose={onDeleteOpenChange}
        onUserDeleted={handleUserDeleted}
      />
    </>
  );
}
