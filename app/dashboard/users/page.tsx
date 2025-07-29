import { Metadata } from "next";

import UsersClientPage from "./UsersClientPage";

export const metadata: Metadata = {
  title: "User Management",
  description: "Manage users and view statistics",
};

export default function UsersPage() {
  return <UsersClientPage />;
}
