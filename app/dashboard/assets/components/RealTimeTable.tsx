"use client";

import { useAssets } from "../hooks/useAssets";
import { AssetPayload } from "../types";

import TableDatas from "./TableData";

interface RealTimeTableProps {
  initialData: AssetPayload[];
  initialUsers: Array<{ id: string; name: string }>;
}

export default function RealTimeTable({
  initialData,
  initialUsers,
}: RealTimeTableProps) {
  const { assets, users, isLoading, mutate } = useAssets();

  // Gunakan initial data jika SWR masih loading
  const displayData = isLoading ? initialData : assets;
  const displayUsers = isLoading ? initialUsers : users;

  return (
    <TableDatas dataTable={displayData} mutate={mutate} users={displayUsers} />
  );
}
