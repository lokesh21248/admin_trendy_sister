import { createClient } from "@/lib/supabase/client"

export type StorageBucket = "product-images" | "category-images" | "banner-images"

export interface UploadResult {
  url: string
  path: string
  error?: string | null
}

/**
 * Uploads an image file to the designated Supabase Storage bucket.
 * Generates a sanitized, timestamped filename (alphanumeric + hyphens only)
 * and returns the public CDN URL. Throws a descriptive error on failure
 * so the UI can show it to the user rather than silently saving a broken URL.
 */
export async function uploadImageToStorage(
  file: File,
  bucket: StorageBucket = "product-images",
  prefix: string = "upload"
): Promise<UploadResult> {
  const supabase = createClient()

  // Sanitize filename: lowercase, alphanumeric+hyphens only, no leading/trailing/double hyphens
  const ext = file.name.split(".").pop()?.toLowerCase()?.replace(/[^a-z0-9]/g, "") || "jpg"
  const cleanName = file.name
    .replace(/\.[^/.]+$/, "")     // remove extension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, "")     // trim leading/trailing hyphens
    .replace(/-{2,}/g, "-")      // collapse consecutive hyphens
    .slice(0, 40)                 // limit length
    .replace(/^-+|-+$/g, "")     // trim again after slice
    || "image"                    // fallback if name becomes empty

  const timestamp = Date.now()
  const filePath = `${prefix}-${cleanName}-${timestamp}.${ext}`

  try {
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    })

    if (error) {
      console.error(`Supabase storage upload error in '${bucket}':`, error)
      throw new Error(`Upload failed: ${error.message}. Please try again or use a different image file.`)
    }

    if (data) {
      const { data: pubData } = supabase.storage.from(bucket).getPublicUrl(data.path)
      return {
        url: pubData.publicUrl,
        path: data.path,
        error: null,
      }
    }

    throw new Error("Upload succeeded but no data returned. Please retry.")
  } catch (err: any) {
    // Re-throw so the UI catches and shows the error to the user
    throw new Error(err?.message || "Failed to upload image. Please try again.")
  }
}

/**
 * Helper to convert File to base64 data URL
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}
