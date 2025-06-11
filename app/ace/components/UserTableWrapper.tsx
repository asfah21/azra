"use client";

import { UserTables } from "./UserTable";

interface Props {
  users: any[];
}

export default function UserTableWrapper({ users }: Props) {
  return <UserTables users={users} />;
}
