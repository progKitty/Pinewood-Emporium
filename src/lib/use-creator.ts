import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export type CreatorRow = {
  id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  website: string | null;
  status: string;
};

export function useMyCreator() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-creator", user?.id ?? null],
    enabled: !!user,
    queryFn: async (): Promise<CreatorRow | null> => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("creators")
        .select("id, display_name, bio, avatar_url, location, website, status")
        .eq("id", user.id)
        .maybeSingle();
      if (error) return null;
      return (data as CreatorRow | null) ?? null;
    },
    staleTime: 30_000,
  });
}
