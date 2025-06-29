export interface BreakdownPayload {
  id: string;
  breakdownNumber: string | null;
  description: string;
  breakdownTime: Date;
  workingHours: number;
  status: "pending" | "in_progress" | "rfu" | "overdue";
  priority: string | null;
  createdAt: Date;
  unitId: string;
  reportedById: string;
  shift: string | null;
  unit: {
    id: string;
    assetTag: string;
    name: string;
    location: string;
    department: string | null;
    categoryId: number;
    status: string;
  };
  reportedBy: {
    id: string;
    name: string;
    email: string;
    department: string | null;
  };
  components: {
    id: string;
    component: string;
    subcomponent: string;
  }[];
  rfuReport?: {
    id: string;
    solution: string;
    resolvedAt: Date;
    resolvedById: string;
    resolvedBy: {
      id: string;
      name: string;
      email: string;
    };
  } | null;
  inProgressById: string | null;
  inProgressAt: Date | null;
  inProgressBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface BreakdownStats {
  total: number;
  progress: number;
  rfu: number;
  pending: number;
  overdue: number;
} 