// Fingerprint related types
import type { Employee } from "./user";

export interface FingerprintLog {
  id: number | string;
  user_id?: number | string;
  type?: number;
  device_sn?: string;
  timestamp?: string;
  created_at?: string;
  updated_at?: string;
  // Joined user data
  user?: Employee;
}

export interface FingerprintDevice {
  id: number | string;
  device_sn: string;
  device_name?: string;
  ip_address?: string;
  port?: number;
  location?: string;
  status?: "active" | "inactive" | "maintenance";
  last_sync?: string;
  created_at?: string;
  updated_at?: string;
}

// Export data types
export interface ExportParams {
  range: "today" | "yesterday" | "last7" | "last30" | "all";
  search?: string;
  join?: string;
}

// API Response types
export interface FingerprintLogsResponse {
  rows: FingerprintLog[];
  total: number;
  page: number;
  pageSize: number;
}

// Attendance type mapping
export type AttendanceType = 0 | 1 | 4 | 5;

export interface AttendanceTypeConfig {
  [key: number]: {
    label: string;
    color: "success" | "danger" | "primary" | "warning" | "default";
  };
}
