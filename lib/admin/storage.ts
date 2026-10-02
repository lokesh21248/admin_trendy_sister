import { createClient } from "@/lib/supabase/client"

export type StorageBucket = "product-images" | "category-images" | "banner-images"

export interface UploadResult {
  url: string
  path: string
  error?: string | null
}

/**
 * Uploads an image file via the server-side /api/upload route.
 * The server uses the Supabase service role key which bypasses RLS entirely.
 * This is the safest approach — no client-side RLS policy issues possible.
 */
export async function uploadImageToStorage(
  file: File,
  bucket: StorageBucket = "product-images",
  prefix: string = "upload"
): Promise<UploadResult> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed (JPG, PNG, WEBP).")
  }

  if (file.size > 15 * 1024 * 1024) {
    throw new Error("File size exceeds 15MB limit.")
  }

  const formData = new FormData()
  formData.append("file", file)
  formData.append("bucket", bucket)
  formData.append("prefix", prefix)

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  })

  const data = await res.json()

  if (!res.ok || data.error) {
    throw new Error(data.error || "Upload failed. Please try again.")
  }

  return {
    url: data.url,
    path: data.path,
    error: null,
  }
}

/**
 * Helper to convert File to base64 data URL (kept for potential use elsewhere)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

