export async function uploadCreatorFile(
  userId: string,
  file: File,
  folder: "images" | "videos" = "images",
): Promise<string> {
  // Temporary stub for media uploads.
  // In a real implementation, you would use FormData and POST to a Django endpoint
  // e.g. /api/upload/
  return URL.createObjectURL(file);
}
