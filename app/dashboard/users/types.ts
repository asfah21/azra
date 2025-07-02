export interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  createdAt: Date;
  lastActive: Date | null;
  photo?: string | null;
}

export interface UserStats {
  total: number;
  new: number;
  active: number;
  inactive: number;
}
