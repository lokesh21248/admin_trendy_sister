import { NextRequest, NextResponse } from "next/server"

const SUPABASE_URL = "https://efirqiluvuerurnpptfm.supabase.co"
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const ANON_KEY = "sb_publishable_xHWxpegsG3AQTZt4mqubiQ_it5Go61G"

export async function POST(req: NextRequest) {
  try {
    // Prefer service role key (bypasses RLS); fall back to anon key
    const authKey = SERVICE_ROLE_KEY || ANON_KEY

    // Parse multipart form data
    let file: File | null = null
    let bucket = "product-images"
    let prefix = "upload"

    try {
      const formData = await req.formData()
      file = formData.get("file") as File | null
      bucket = (formData.get("bucket") as string) || "product-images"
      prefix = (formData.get("prefix") as string) || "upload"
    } catch {
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

    // Convert file to Uint8Array
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload directly via Supabase Storage REST API (bypasses SDK auth layer)
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${filePath}`
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "apikey": authKey,
        "Authorization": `Bearer ${authKey}`,
        "Content-Type": file.type || "image/jpeg",
        "x-upsert": "true",
      },
      body: buffer,
    })

    if (!uploadRes.ok) {
      const errBody = await uploadRes.text()
      console.error("[/api/upload] REST upload failed:", uploadRes.status, errBody)
      return NextResponse.json(
        { error: `Upload failed (${uploadRes.status}): ${errBody}` },
        { status: 500 }
      )
    }

    // Build public URL
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`

    return NextResponse.json({ url: publicUrl, path: filePath })
  } catch (err: any) {
    console.error("[/api/upload] Unexpected error:", err?.message)
    return NextResponse.json({ error: err?.message || "Upload failed" }, { status: 500 })
  }
}
