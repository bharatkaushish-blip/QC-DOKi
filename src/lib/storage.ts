import { createClient } from "@supabase/supabase-js";

const BUCKET_NAME = "form-photos";

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function uploadFormPhoto(
  file: Buffer,
  filename: string
): Promise<string> {
  const supabase = getSupabase();
  const path = `uploads/${Date.now()}_${filename}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      contentType: inferContentType(filename),
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload photo: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);

  return publicUrl;
}

export function getPhotoUrl(path: string): string {
  const supabase = getSupabase();
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);

  return publicUrl;
}

function inferContentType(filename: string): string {
  const ext = filename.toLowerCase().split(".").pop();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
      return "image/heic";
    default:
      return "application/octet-stream";
  }
}
