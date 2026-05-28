import { useAuth } from "@/lib/auth-context";

export function useCreator(): boolean {
  const { user } = useAuth();
  return user?.role === "VENDOR";
}
