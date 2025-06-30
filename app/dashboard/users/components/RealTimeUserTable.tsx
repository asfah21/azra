"use client";

import { useUsers } from "../hooks/useUsers";
import { UserPayload } from "../types";

import UserTables from "./UserTable";

interface RealTimeUserTableProps {
  initialData: UserPayload[];
}

export default function RealTimeUserTable({
  initialData,
}: RealTimeUserTableProps) {
  const { users, isLoading, mutate } = useUsers();

  // Gunakan initial data jika SWR masih loading
  const displayData = isLoading ? initialData : users;

  return <UserTables mutate={mutate} usersTable={displayData} />;
}
