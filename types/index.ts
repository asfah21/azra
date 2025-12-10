// Central export for all type definitions

// User types
export type {
  BaseUser,
  Employee,
  UserProfile,
  UsersResponse,
  UserCreateData,
  UserUpdateData,
} from "./user";

// Fingerprint types
export type {
  FingerprintLog,
  FingerprintDevice,
  ExportParams,
  FingerprintLogsResponse,
  AttendanceType,
  AttendanceTypeConfig,
} from "./fingerprint";

import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};
