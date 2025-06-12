"use client";

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
  Mail,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

export default function UserTables() {
  // Mock data untuk users
  const userStats = {
    totalUsers: 1247,
    activeUsers: 892,
    newUsersToday: 23,
    inactiveUsers: 355,
    growthRate: 12.5,
    onlineNow: 156,
  };

  const topUsers = [
    {
      id: 1,
      name: "Ahmad Ridwan",
      email: "ahmad.ridwan@company.com",
      role: "Admin",
      department: "IT Operations",
      avatar: "https://i.pravatar.cc/150?u=1",
      status: "online",
      lastActive: "Active now",
      tasksCompleted: 145,
      joinDate: "Jan 2023",
    },
    {
      id: 2,
      name: "Siti Nurhaliza",
      email: "siti.nurhaliza@company.com",
      role: "Technician",
      department: "Maintenance",
      avatar: "https://i.pravatar.cc/150?u=2",
      status: "online",
      lastActive: "2 minutes ago",
      tasksCompleted: 132,
      joinDate: "Mar 2023",
    },
    {
      id: 3,
      name: "Budi Santoso",
      email: "budi.santoso@company.com",
      role: "Supervisor",
      department: "Production",
      avatar: "https://i.pravatar.cc/150?u=3",
      status: "away",
      lastActive: "15 minutes ago",
      tasksCompleted: 98,
      joinDate: "Jun 2022",
    },
    {
      id: 4,
      name: "Maya Sari",
      email: "maya.sari@company.com",
      role: "Manager",
      department: "Quality Control",
      avatar: "https://i.pravatar.cc/150?u=4",
      status: "offline",
      lastActive: "3 hours ago",
      tasksCompleted: 87,
      joinDate: "Sep 2022",
    },
    {
      id: 5,
      name: "Indra Kusuma",
      email: "indra.kusuma@company.com",
      role: "Operator",
      department: "Manufacturing",
      avatar: "https://i.pravatar.cc/150?u=5",
      status: "online",
      lastActive: "Just now",
      tasksCompleted: 76,
      joinDate: "Nov 2023",
    },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "danger";
      case "Manager":
        return "warning";
      case "Supervisor":
        return "secondary";
      case "Technician":
        return "primary";
      case "Operator":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "success";
      case "away":
        return "warning";
      case "offline":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex gap-3">
          <div className="p-2 bg-default-500 rounded-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col flex-1">
            <p className="text-xl font-semibold text-default-800">All Users</p>
            <p className="text-small text-default-600">
              Complete user directory and management
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              color="default"
              size="sm"
              startContent={<Filter className="w-4 h-4" />}
              variant="flat"
            >
              Filter
            </Button>
            <Button
              color="primary"
              size="sm"
              startContent={<UserPlus className="w-4 h-4" />}
            >
              Add User
            </Button>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-0">
          <Table aria-label="Users table">
            <TableHeader>
              <TableColumn>USER</TableColumn>
              <TableColumn>ROLE</TableColumn>
              <TableColumn>DEPARTMENT</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>TASKS</TableColumn>
              <TableColumn>JOINED</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {topUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <User
                      avatarProps={{
                        radius: "lg",
                        src: user.avatar,
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
                      {user.role}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="text-small">
                      <p className="font-medium">{user.department}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={getStatusColor(user.status) as any}
                      size="sm"
                      variant="dot"
                    >
                      {user.status}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="text-small">
                      <p className="font-medium">{user.tasksCompleted}</p>
                      <p className="text-default-500">completed</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-small">
                      <p>{user.joinDate}</p>
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
                          >
                            View
                          </DropdownItem>
                          <DropdownItem
                            key="edit"
                            startContent={<Edit className="w-4 h-4" />}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="contact"
                            startContent={<Mail className="w-4 h-4" />}
                          >
                            Contact
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<Trash2 className="w-4 h-4" />}
                          >
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </>
  );
}
