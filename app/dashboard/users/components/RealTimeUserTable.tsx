"use client";

import { UserPayload } from "../types";

import UserTables from "./UserTable";

interface RealTimeUserTableProps {
  users: UserPayload[];
}

export default function RealTimeUserTable({ users }: RealTimeUserTableProps) {
  return <UserTables usersTable={users} />;
}
