// General User types that can be used across the application

export interface BaseUser {
  id: number | string;
  name?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Employee extends BaseUser {
  fid?: string | number;
  nik?: string | number;
  department?: string;
  jabatan?: string;
  photo?: string;
  phone?: string;
  position?: string;
  status?: "active" | "inactive" | "suspended";
  hire_date?: string;
}

export interface UserProfile extends Employee {
  // Additional profile fields
  address?: string;
  birth_date?: string;
  gender?: "male" | "female";
  emergency_contact?: string;
  emergency_phone?: string;
}

// API Response types
export interface UsersResponse {
  rows: Employee[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UserCreateData {
  name: string;
  email: string;
  nik: string;
  department: string;
  position?: string;
  phone?: string;
  photo?: string;
  fid?: string | number;
}

export interface UserUpdateData extends Partial<UserCreateData> {
  id: number | string;
}
