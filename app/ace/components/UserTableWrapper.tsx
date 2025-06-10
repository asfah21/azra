// Ini adalah wrapper / boundary agar tidak error di vercel karena Server Component page.tsx TIDAK BOLEH langsung mengimpor Client Component.
"use client";

import { UserTables } from "./UserTable";
interface Props {
  users: any[];
}

export default function UserTableWrapper({ users }: Props) {
  return <UserTables users={users} />;
}
