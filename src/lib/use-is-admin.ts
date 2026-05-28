import { useAuth } from "@/lib/auth-context";

export function useIsAdmin(): boolean {
  const { user } = useAuth();
  return user?.role === "ADMIN";
}
