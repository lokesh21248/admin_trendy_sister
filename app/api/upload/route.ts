import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://efirqiluvuerurnpptfm.supabase.co"
// Service role key bypasses RLS — kept server-side only, never exposed to client
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_xHWxpegsG3AQTZt4mqubiQ_it5Go61G"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const bucket = (formData.get("bucket") as string) || "product-images"
    const prefix = (formData.get("prefix") as string) || "upload"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
    }

    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 15MB limit" }, { status: 400 })
    }

    // Sanitize filename
    const ext = file.name.split(".").pop()?.toLowerCase()?.replace(/[^a-z0-9]/g, "") || "jpg"
    const cleanName = file.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-")
      .slice(0, 40)
      .replace(/^-+|-+$/g, "") || "image"

    const timestamp = Date.now()
    const filePath = `${prefix}-${cleanName}-${timestamp}.${ext}`

    // Use service role key if available (bypasses RLS), otherwise fall back to anon key
    const key = SERVICE_ROLE_KEY || ANON_KEY
    const supabase = createClient(SUPABASE_URL, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    const { data, error } = await supabase.storage.from(bucket).upload(filePath, fileBuffer, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    })

    if (error) {
      console.error("Server upload error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: pubData } = supabase.storage.from(bucket).getPublicUrl(data.path)

    return NextResponse.json({ url: pubData.publicUrl, path: data.path })
  } catch (err: any) {
    console.error("Upload route exception:", err)
    return NextResponse.json({ error: err?.message || "Upload failed" }, { status: 500 })
  }
}
