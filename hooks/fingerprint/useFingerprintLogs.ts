import { useQuery } from "@tanstack/react-query";
import type { FingerprintLog, FingerprintLogsResponse } from "@/types";

export function useFingerprintLogs({
  page,
  search,
}: {
  page: number;
  search: string;
}) {
  const queryKey = ["fingerprintLogs", { page, search }];

  const query = useQuery<FingerprintLogsResponse>({
    queryKey,
    queryFn: async () => {
      let res: Response;
      
      if (search && search.trim().length >= 2) {
        // Use search endpoint
        const searchParams = new URLSearchParams({
          q: search.trim(),
          page: String(page),
        });
        res = await fetch(`/api/fingerprint/search?${searchParams.toString()}`, {
          cache: "no-store",
        });
      } else {
        // Use regular table endpoint
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("join", "user");
        
        res = await fetch(`/api/fingerprint/table?${params.toString()}`, {
          cache: "no-store",
        });
      }

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

      const total: number | null =
        typeof json?.total === "number" ? json.total : null;
      const pageSize: number | undefined =
        typeof json?.pageSize === "number" ? json.pageSize : undefined;

      const usersByFid: Record<string, string> = {};
      const usersDeptByFid: Record<string, string> = {};
      const usersJabatanByFid: Record<string, string> = {};
      const usersNikByFid: Record<string, string> = {};
      const usersPhotoByFid: Record<string, string> = {};

      for (const r of rows) {
        const fidKey =
          r.user?.fid != null
            ? String(r.user.fid)
            : r.user_id != null
              ? String(r.user_id)
              : undefined;

        if (!fidKey) continue;
        const name =
          r.user?.name ??
          (typeof (r as any)["name"] === "string"
            ? (r as any)["name"]
            : undefined);
        const dept =
          r.user?.department ??
          (typeof (r as any)["department"] === "string"
            ? (r as any)["department"]
            : undefined);
        const jabatan =
          r.user?.jabatan ??
          (typeof (r as any)["jabatan"] === "string"
            ? (r as any)["jabatan"]
            : undefined);
        const nikVal =
          r.user?.nik ??
          (typeof (r as any)["nik"] === "string" ||
          typeof (r as any)["nik"] === "number"
            ? (r as any)["nik"]
            : undefined);
        const photo =
          r.user?.photo ??
          (typeof (r as any)["photo"] === "string"
            ? (r as any)["photo"]
            : undefined);

        if (name != null) usersByFid[fidKey] = String(name);
        if (dept != null) usersDeptByFid[fidKey] = String(dept);
        if (jabatan != null) usersJabatanByFid[fidKey] = String(jabatan);
        if (nikVal != null) usersNikByFid[fidKey] = String(nikVal);
        if (photo != null) usersPhotoByFid[fidKey] = String(photo);
      }

      return {
        rows,
        total,
        page,
        pageSize,
        usersByFid,
        usersDeptByFid,
        usersJabatanByFid,
        usersNikByFid,
        usersPhotoByFid,
      } as FingerprintLogsResponse & {
        usersByFid: Record<string, string>;
        usersDeptByFid: Record<string, string>;
        usersJabatanByFid: Record<string, string>;
        usersNikByFid: Record<string, string>;
        usersPhotoByFid: Record<string, string>;
      };
    },
    staleTime: 30_000,
    placeholderData: (prev) => prev ?? undefined,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data as
      | (FingerprintLogsResponse & {
          usersByFid: Record<string, string>;
          usersDeptByFid: Record<string, string>;
          usersJabatanByFid: Record<string, string>;
          usersNikByFid: Record<string, string>;
          usersPhotoByFid: Record<string, string>;
        })
      | undefined,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    usersByFid: (query.data as any)?.usersByFid ?? {},
    usersDeptByFid: (query.data as any)?.usersDeptByFid ?? {},
    usersJabatanByFid: (query.data as any)?.usersJabatanByFid ?? {},
    usersNikByFid: (query.data as any)?.usersNikByFid ?? {},
    usersPhotoByFid: (query.data as any)?.usersPhotoByFid ?? {},
    pageSize: (query.data as any)?.pageSize ?? 20,
  };
}
