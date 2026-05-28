import { supabase } from "@/integrations/supabase/client";

const BUCKET = "creator-media";

function safeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-").slice(0, 80);
}

export async function uploadCreatorFile(
  userId: string,
  file: File,
  folder: "images" | "videos" = "images",
): Promise<string> {
  const path = `${userId}/${folder}/${Date.now()}-${safeName(file.name)}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "31536000", upsert: false });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
