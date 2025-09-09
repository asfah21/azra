"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Divider,
  Chip,
  User,
  Avatar,
} from "@heroui/react";
import {
  Calendar,
  Clock,
  Mail,
  MapPin,
  Shield,
  UserCheck,
  UserX,
  Activity,
} from "lucide-react";

import { useRoleMap } from "@/hooks/useRoles";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  createdAt: Date;
  lastActive: Date | null;
}

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function UserDetailModal({
  isOpen,
  onClose,
  user,
}: UserDetailModalProps) {
  // Dynamic role mapping
  const { getRoleLabel, getRoleColor, loading: roleLoading } = useRoleMap();

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Always render modal content, disable fields if no user
  return (
    <Modal isOpen={isOpen} placement="top-center" size="2xl" onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <Avatar
                  className="bg-primary text-white"
                  name={user?.name || ""}
                  size="lg"
                />
                <div>
                  <h2 className="text-xl font-semibold">{user?.name || ""}</h2>
                  <p className="text-sm text-default-500">{user?.email || ""}</p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                {/* Status dan Role */}
                <div className="flex flex-wrap gap-3">
                  <Chip
                    classNames={{
                      content:
                        getUserStatus(user?.lastActive || null) === "online"
                          ? "text-success-600 font-medium"
                          : "",
                    }}
                    color={
                      getStatusColor(getUserStatus(user?.lastActive || null)) as any
                    }
                    size="lg"
                    startContent={
                      getUserStatus(user?.lastActive || null) === "online" ? (
                        <UserCheck className="w-4 h-4" />
                      ) : (
                        <UserX className="w-4 h-4" />
                      )
                    }
                    variant="dot"
                  >
                    {getUserStatus(user?.lastActive || null)}
                  </Chip>
                  <Chip
                    color={getRoleColor(user?.role || "") as any}
                    size="lg"
                    startContent={<Shield className="w-4 h-4" />}
                    variant="flat"
                  >
                    {getRoleLabel(user?.role || "")}
                  </Chip>
                </div>

                <Divider />

                {/* Informasi Detail */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-default-50">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Mail className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Email</h3>
                      </div>
                      <p className="text-sm text-default-600">{user?.email || ""}</p>
                    </CardBody>
                  </Card>

                  <Card className="bg-default-50">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <MapPin className="w-5 h-5 text-secondary" />
                        <h3 className="font-semibold">Department</h3>
                      </div>
                      <p className="text-sm text-default-600">
                        {user?.department || "Not assigned"}
                      </p>
                    </CardBody>
                  </Card>

                  <Card className="bg-default-50">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Calendar className="w-5 h-5 text-success" />
                        <h3 className="font-semibold">Joined Date</h3>
                      </div>
                      <p className="text-sm text-default-600">
                        {user?.createdAt ? formatDate(user.createdAt) : ""}
                      </p>
                    </CardBody>
                  </Card>

                  <Card className="bg-default-50">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Activity className="w-5 h-5 text-warning" />
                        <h3 className="font-semibold">Last Active</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {formatLastActive(user?.lastActive || null).emoji}
                        </span>
                        <Chip
                          color={formatLastActive(user?.lastActive || null).color as any}
                          size="sm"
                          variant="flat"
                        >
                          {formatLastActive(user?.lastActive || null).text}
                        </Chip>
                      </div>
                    </CardBody>
                  </Card>
                </div>

                <Divider />

                {/* Statistik Aktivitas */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Activity Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-success-50 border-success-200">
                      <CardBody className="p-3 text-center">
                        <p className="text-2xl font-bold text-success">0</p>
                        <p className="text-xs text-success-600">Login Today</p>
                      </CardBody>
                    </Card>
                    <Card className="bg-primary-50 border-primary-200">
                      <CardBody className="p-3 text-center">
                        <p className="text-2xl font-bold text-primary">0</p>
                        <p className="text-xs text-primary-600">This Week</p>
                      </CardBody>
                    </Card>
                    <Card className="bg-warning-50 border-warning-200">
                      <CardBody className="p-3 text-center">
                        <p className="text-2xl font-bold text-warning">0</p>
                        <p className="text-xs text-warning-600">This Month</p>
                      </CardBody>
                    </Card>
                    <Card className="bg-secondary-50 border-secondary-200">
                      <CardBody className="p-3 text-center">
                        <p className="text-2xl font-bold text-secondary">0</p>
                        <p className="text-xs text-secondary-600">Total</p>
                      </CardBody>
                    </Card>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              {/* <Button color="primary" onPress={onClose}>
                Edit User
              </Button> */}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
