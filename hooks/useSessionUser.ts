import { useSession } from "next-auth/react";

export function useSessionUser() {
  const { data } = useSession();

  return data?.user || null;
}
