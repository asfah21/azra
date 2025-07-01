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
import { useState, useMemo } from "react";

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

  // State untuk sorting
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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

  const handleUserAdded = async () => {
    // Refresh halaman untuk mendapatkan data terbaru
    router.refresh();
    onOpenChange();
  };

  const handleUserUpdated = async () => {
    // Refresh halaman untuk mendapatkan data terbaru
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

  const handleUserDeleted = async () => {
    // Refresh halaman untuk mendapatkan data terbaru
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
      return { text: `${diffInDays}d ago`, color: "danger", emoji: "��" };

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
              classNames={{
                wrapper: "min-h-[400px]",
              }}
            >
              <TableHeader>
                <TableColumn>
                  <Button
                    className="px-1 h-auto text-default-500 font-semibold"
                    size="sm"
                    variant="light"
                    onPress={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-1">
                      NAME
                      <SortIcon
                        active={sortColumn === "name"}
                        direction={sortDirection}
                      />
                    </div>
                  </Button>
                </TableColumn>
                <TableColumn>
                  <Button
                    className="px-1 h-auto text-default-500 font-semibold"
                    size="sm"
                    variant="light"
                    onPress={() => handleSort("email")}
                  >
                    <div className="flex items-center gap-1">
                      EMAIL
                      <SortIcon
                        active={sortColumn === "email"}
                        direction={sortDirection}
                      />
                    </div>
                  </Button>
                </TableColumn>
                <TableColumn>
                  <Button
                    className="px-1 h-auto text-default-500 font-semibold"
                    size="sm"
                    variant="light"
                    onPress={() => handleSort("role")}
                  >
                    <div className="flex items-center gap-1">
                      ROLE
                      <SortIcon
                        active={sortColumn === "role"}
                        direction={sortDirection}
                      />
                    </div>
                  </Button>
                </TableColumn>
                <TableColumn>
                  <Button
                    className="px-1 h-auto text-default-500 font-semibold"
                    size="sm"
                    variant="light"
                    onPress={() => handleSort("department")}
                  >
                    <div className="flex items-center gap-1">
                      DEPARTMENT
                      <SortIcon
                        active={sortColumn === "department"}
                        direction={sortDirection}
                      />
                    </div>
                  </Button>
                </TableColumn>
                <TableColumn>
                  <Button
                    className="px-1 h-auto text-default-500 font-semibold"
                    size="sm"
                    variant="light"
                    onPress={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center gap-1">
                      CREATED
                      <SortIcon
                        active={sortColumn === "createdAt"}
                        direction={sortDirection}
                      />
                    </div>
                  </Button>
                </TableColumn>
                <TableColumn>
                  <Button
                    className="px-1 h-auto text-default-500 font-semibold"
                    size="sm"
                    variant="light"
                    onPress={() => handleSort("lastActive")}
                  >
                    <div className="items-center gap-1">
                      LAST ACTIVE
                      <SortIcon
                        active={sortColumn === "lastActive"}
                        direction={sortDirection}
                      />
                    </div>
                  </Button>
                </TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No users found." items={items}>
                {(user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <User
                        avatarProps={{
                          radius: "full",
                          src: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
                        }}
                        description={user.email}
                        name={user.name}
                      >
                        {user.email}
                      </User>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        color={getRoleColor(user.role)}
                        size="sm"
                        variant="flat"
                      >
                        {getRoleLabel(user.role)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {user.department ? (
                        <Chip color="default" size="sm" variant="flat">
                          {user.department}
                        </Chip>
                      ) : (
                        <span className="text-default-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.createdAt.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Chip
                          color={getStatusColor(getUserStatus(user.lastActive))}
                          size="sm"
                          variant="flat"
                        >
                          {getUserStatus(user.lastActive)}
                        </Chip>
                        <span className="text-xs text-default-500">
                          {formatLastActive(user.lastActive).text}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
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
                            <DropdownItem
                              key="edit"
                              startContent={<Edit className="w-4 h-4" />}
                              onPress={() => handleEditUser(user)}
                            >
                              Edit User
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              startContent={<Trash2 className="w-4 h-4" />}
                              onPress={() => handleDeleteUser(user)}
                            >
                              Delete User
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={isOpen}
        placement="top-center"
        size="2xl"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          <AddUserForms onClose={onOpenChange} onUserAdded={handleUserAdded} />
        </ModalContent>
      </Modal>

      {/* User Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        placement="top-center"
        size="2xl"
        onOpenChange={onDetailOpenChange}
      >
        <ModalContent>
          <UserDetailModal user={selectedUser} onClose={onDetailOpenChange} />
        </ModalContent>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditOpen}
        placement="top-center"
        size="2xl"
        onOpenChange={onEditOpenChange}
      >
        <ModalContent>
          <EditUserModal
            user={selectedUser}
            onClose={onEditOpenChange}
            onUserUpdated={handleUserUpdated}
          />
        </ModalContent>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={isDeleteOpen}
        placement="top-center"
        size="md"
        onOpenChange={onDeleteOpenChange}
      >
        <ModalContent>
          <DeleteConfirmModal
            user={selectedUser}
            onClose={onDeleteOpenChange}
            onUserDeleted={handleUserDeleted}
          />
        </ModalContent>
      </Modal>
    </>
  );
}
