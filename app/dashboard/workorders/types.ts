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

// Types untuk Server Actions
export interface CreateBreakdownData {
  description: string;
  breakdownTime: string;
  workingHours: number;
  unitId: string;
  reportedById: string;
  priority: string;
  shift: string;
  components: Array<{ component: string; subcomponent: string }>;
}

export interface UpdateBreakdownStatusData {
  id: string;
  status: "pending" | "in_progress" | "rfu" | "overdue";
  resolvedById?: string;
}

export interface UpdateBreakdownWithUnitStatusData {
  id: string;
  status: "pending" | "in_progress" | "rfu" | "overdue";
  unitStatus: string;
  notes?: string;
  resolvedById?: string;
}

export interface DeleteBreakdownData {
  id: string;
}

// Types untuk optimistic updates
export interface OptimisticBreakdownUpdate {
  id: string;
  status?: "pending" | "in_progress" | "rfu" | "overdue";
  deleted?: boolean;
}
