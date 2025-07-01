"use client";

import { BreakdownPayload } from "../types";

import GammaTableData from "./TableData";

interface RealTimeTableProps {
  initialData: BreakdownPayload[];
}

export default function RealTimeTable({ initialData }: RealTimeTableProps) {
  return <GammaTableData dataTable={initialData} />;
}
