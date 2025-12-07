import { useQuery } from "@tanstack/react-query";

export type FingerprintLog = {
  id: number | string;
  user_id?: number | string;
  type?: number;
  device_sn?: string;
  timestamp?: string;
  created_at?: string;
  // Optional embedded user info from backend join
  user?: {
    fid?: string | number;
    name?: string;
    department?: string;
    nik?: string | number;
    photo?: string;
  } | null;
  [key: string]: any;
};

export type FingerprintResponse = {
  rows: FingerprintLog[];
  total?: number | null;
  pageSize?: number;
};

export function useFingerprintLogs({ page, search }: { page: number; search: string }) {
  const queryKey = ["fingerprintLogs", { page, search }];

  const query = useQuery<FingerprintResponse>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("join", "user");
      if (search && search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/fingerprint/table?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Fetch error (${res.status}): ${text}`);
      }
      const json = await res.json();

      const rows: FingerprintLog[] = Array.isArray(json?.rows)
        ? json.rows
        : Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json)
            ? json
            : [];

      const total: number | null = typeof json?.total === "number" ? json.total : null;
      const pageSize: number | undefined = typeof json?.pageSize === "number" ? json.pageSize : undefined;

      const usersByFid: Record<string, string> = {};
      const usersDeptByFid: Record<string, string> = {};
      const usersNikByFid: Record<string, string> = {};
      const usersPhotoByFid: Record<string, string> = {};

      for (const r of rows) {
        const fidKey = r.user?.fid != null ? String(r.user.fid) : r.user_id != null ? String(r.user_id) : undefined;
        if (!fidKey) continue;
        const name = r.user?.name ?? (typeof (r as any)["name"] === "string" ? (r as any)["name"] : undefined);
        const dept = r.user?.department ?? (typeof (r as any)["department"] === "string" ? (r as any)["department"] : undefined);
        const nikVal = r.user?.nik ?? (typeof (r as any)["nik"] === "string" || typeof (r as any)["nik"] === "number" ? (r as any)["nik"] : undefined);
        const photo = r.user?.photo ?? (typeof (r as any)["photo"] === "string" ? (r as any)["photo"] : undefined);
        if (name != null) usersByFid[fidKey] = String(name);
        if (dept != null) usersDeptByFid[fidKey] = String(dept);
        if (nikVal != null) usersNikByFid[fidKey] = String(nikVal);
        if (photo != null) usersPhotoByFid[fidKey] = String(photo);
      }

      return {
        rows,
        total,
        pageSize,
        usersByFid,
        usersDeptByFid,
        usersNikByFid,
        usersPhotoByFid,
      } as FingerprintResponse & {
        usersByFid: Record<string, string>;
        usersDeptByFid: Record<string, string>;
        usersNikByFid: Record<string, string>;
        usersPhotoByFid: Record<string, string>;
      };
    },
    staleTime: 30_000,
    placeholderData: (prev) => prev ?? undefined,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data as (FingerprintResponse & {
      usersByFid: Record<string, string>;
      usersDeptByFid: Record<string, string>;
      usersNikByFid: Record<string, string>;
      usersPhotoByFid: Record<string, string>;
    }) | undefined,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    usersByFid: (query.data as any)?.usersByFid ?? {},
    usersDeptByFid: (query.data as any)?.usersDeptByFid ?? {},
    usersNikByFid: (query.data as any)?.usersNikByFid ?? {},
    usersPhotoByFid: (query.data as any)?.usersPhotoByFid ?? {},
    pageSize: (query.data as any)?.pageSize ?? 20,
  };
}