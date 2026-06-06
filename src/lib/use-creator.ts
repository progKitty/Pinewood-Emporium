import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./api-client";

export function useCreator(): boolean {
  const { user } = useAuth();
  return user?.role === "VENDOR";
}

export function useMyCreator() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-creator"],
    queryFn: async () => {
      const profiles = await apiClient.get<any[]>('/vendor/profiles/');
      // Django returns a list, find the one belonging to this user
      return profiles.length > 0 ? profiles[0] : null;
    },
    enabled: !!user && user.role === "VENDOR",
  });
}
