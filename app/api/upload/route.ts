import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://efirqiluvuerurnpptfm.supabase.co"
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const ANON_KEY = "sb_publishable_xHWxpegsG3AQTZt4mqubiQ_it5Go61G"

export async function POST(req: NextRequest) {
  try {
    // Use service role key if set (bypasses RLS), otherwise anon key
    const authKey = SERVICE_ROLE_KEY || ANON_KEY

    const supabase = createClient(SUPABASE_URL, authKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    let file: File | null = null
    let bucket = "product-images"
    let prefix = "upload"

    // Parse multipart form data
    try {
      const formData = await req.formData()
      file = formData.get("file") as File | null
      bucket = (formData.get("bucket") as string) || "product-images"
      prefix = (formData.get("prefix") as string) || "upload"
    } catch (e) {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
    }

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
    }

    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 15MB" }, { status: 400 })
    }

    // Sanitize filename
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "")
    const cleanName =
      file.name
        .replace(/\.[^/.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-{2,}/g, "-")
        .slice(0, 40)
        .replace(/^-+|-+$/g, "") || "image"

    const filePath = `${prefix}-${cleanName}-${Date.now()}.${ext}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const { data, error } = await supabase.storage.from(bucket).upload(filePath, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    })

    if (error) {
      console.error("[/api/upload] Supabase error:", error.message, "bucket:", bucket, "key type:", SERVICE_ROLE_KEY ? "service_role" : "anon")
      return NextResponse.json(
        { error: `Storage error: ${error.message}` },
        { status: 500 }
      )
    }

    const { data: pubData } = supabase.storage.from(bucket).getPublicUrl(data.path)

    return NextResponse.json({ url: pubData.publicUrl, path: data.path })
  } catch (err: any) {
    console.error("[/api/upload] Unexpected error:", err?.message)
    return NextResponse.json({ error: err?.message || "Upload failed" }, { status: 500 })
  }
}
