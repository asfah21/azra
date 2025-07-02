"use client";

import { UserPayload } from "../types";

import UserTables from "./UserTable";

interface RealTimeUserTableProps {
  users: UserPayload[];
}

export default function RealTimeUserTable({ users }: RealTimeUserTableProps) {
  const usersFixed = users.map((user) => ({
    ...user,
    photo: user.photo ?? undefined,
  }));

  return <UserTables usersTable={usersFixed} />;
}
