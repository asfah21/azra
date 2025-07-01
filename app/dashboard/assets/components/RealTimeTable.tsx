"use client";

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
  return <TableDatas dataTable={initialData} users={initialUsers} />;
}
