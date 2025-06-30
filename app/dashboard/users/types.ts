export interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  createdAt: Date;
  lastActive: Date | null;
}

export interface UserStats {
  total: number;
  new: number;
  active: number;
  inactive: number;
} 