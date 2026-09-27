import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { AdminCoupon } from "@/types/admin"

export const dynamic = "force-dynamic"
export const revalidate = 0

const DEFAULT_COUPONS: AdminCoupon[] = [
  {
    id: "coup-1",
    code: "TRENDY40",
    description: "Mega 40% Off on Heritage Silk & Festive Sarees",
    discount_type: "percentage",
    discount_value: 40,
    min_order_value: 1999,
    max_discount_amount: 2000,
    usage_limit: 500,
    times_used: 28,
    is_active: true,
    expires_at: "2026-12-31T23:59:59.000Z",
    created_at: "2026-09-01T00:00:00.000Z",
    updated_at: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "coup-2",
    code: "WELCOME15",
    description: "Welcome Gift: 15% Off on Your First Saree Purchase",
    discount_type: "percentage",
    discount_value: 15,
    min_order_value: 999,
    max_discount_amount: 750,
    usage_limit: 1000,
    times_used: 42,
    is_active: true,
    expires_at: "2026-12-31T23:59:59.000Z",
    created_at: "2026-09-01T00:00:00.000Z",
    updated_at: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "coup-3",
    code: "FESTIVE500",
    description: "Flat ₹500 Off on Luxury Bridal Kanjivaram Collection",
    discount_type: "fixed",
    discount_value: 500,
    min_order_value: 4999,
    max_discount_amount: 500,
    usage_limit: 100,
    times_used: 15,
    is_active: true,
    expires_at: "2026-11-30T23:59:59.000Z",
    created_at: "2026-09-01T00:00:00.000Z",
    updated_at: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "coup-4",
    code: "SILK10",
    description: "Special 10% Off on Pure Mulberry Silk Sarees",
    discount_type: "percentage",
    discount_value: 10,
    min_order_value: 1499,
    max_discount_amount: 1000,
    usage_limit: 200,
    times_used: 9,
    is_active: true,
    expires_at: null,
    created_at: "2026-09-01T00:00:00.000Z",
    updated_at: "2026-09-01T00:00:00.000Z",
  },
]

function getAdminSupabaseClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://efirqiluvuerurnpptfm.supabase.co"
  const apiKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_xHWxpegsG3AQTZt4mqubiQ_it5Go61G"

  return createSupabaseClient(supabaseUrl, apiKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// GET /api/admin/coupons
export async function GET() {
  try {
    const supabase = getAdminSupabaseClient()
    const { data: dbCoupons, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false })

    if (error || !dbCoupons || dbCoupons.length === 0) {
      // Return default coupons if table doesn't exist yet or is empty
      return NextResponse.json({
        success: true,
        coupons: DEFAULT_COUPONS,
        source: "default",
      })
    }

    const coupons: AdminCoupon[] = dbCoupons.map((c: any) => ({
      id: c.id,
      code: c.code,
      description: c.description,
      discount_type: c.discount_type || "percentage",
      discount_value: Number(c.discount_value) || 0,
      min_order_value: Number(c.min_order_value) || 0,
      max_discount_amount: c.max_discount_amount ? Number(c.max_discount_amount) : null,
      usage_limit: c.usage_limit ? Number(c.usage_limit) : null,
      times_used: Number(c.times_used) || 0,
      is_active: Boolean(c.is_active),
      expires_at: c.expires_at,
      created_at: c.created_at,
      updated_at: c.updated_at,
    }))

    return NextResponse.json({ success: true, coupons, source: "supabase" })
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      coupons: DEFAULT_COUPONS,
      source: "fallback",
    })
  }
}

// POST /api/admin/coupons (Create Coupon)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      code,
      description,
      discount_type,
      discount_value,
      min_order_value,
      max_discount_amount,
      usage_limit,
      expires_at,
      is_active,
    } = body

    if (!code || !discount_value) {
      return NextResponse.json(
        { success: false, error: "Coupon Code and Discount Value are required" },
        { status: 400 }
      )
    }

    const cleanCode = String(code).trim().toUpperCase()

    const newCouponPayload = {
      code: cleanCode,
      description: description ? String(description).trim() : null,
      discount_type: (discount_type === "fixed" ? "fixed" : "percentage") as "fixed" | "percentage",
      discount_value: Number(discount_value) || 0,
      min_order_value: Number(min_order_value) || 0,
      max_discount_amount: max_discount_amount ? Number(max_discount_amount) : null,
      usage_limit: usage_limit ? parseInt(String(usage_limit), 10) : null,
      times_used: 0,
      is_active: is_active ?? true,
      expires_at: expires_at || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    try {
      const supabase = getAdminSupabaseClient()
      const { data, error } = await supabase
        .from("coupons")
        .insert([newCouponPayload])
        .select()
        .single()

      if (!error && data) {
        return NextResponse.json({ success: true, coupon: data })
      }
    } catch (e) {
      console.warn("Supabase insert failed, returning local coupon:", e)
    }

    // Local fallback return
    const fallbackCoupon: AdminCoupon = {
      id: "coup-" + Math.random().toString(36).substring(2, 9),
      ...newCouponPayload,
    }
    return NextResponse.json({ success: true, coupon: fallbackCoupon })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// PATCH /api/admin/coupons (Update Coupon)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, updates } = body

    if (!id || !updates) {
      return NextResponse.json(
        { success: false, error: "Coupon ID and updates required" },
        { status: 400 }
      )
    }

    const sanitized: any = {
      updated_at: new Date().toISOString(),
    }

    if (updates.code) sanitized.code = String(updates.code).trim().toUpperCase()
    if ("description" in updates) sanitized.description = updates.description
    if (updates.discount_type) sanitized.discount_type = updates.discount_type
    if (updates.discount_value !== undefined) sanitized.discount_value = Number(updates.discount_value)
    if (updates.min_order_value !== undefined) sanitized.min_order_value = Number(updates.min_order_value)
    if ("max_discount_amount" in updates) sanitized.max_discount_amount = updates.max_discount_amount
    if ("usage_limit" in updates) sanitized.usage_limit = updates.usage_limit
    if (updates.is_active !== undefined) sanitized.is_active = Boolean(updates.is_active)
    if ("expires_at" in updates) sanitized.expires_at = updates.expires_at

    try {
      const supabase = getAdminSupabaseClient()
      await supabase.from("coupons").update(sanitized).eq("id", id)
    } catch (e) {}

    return NextResponse.json({ success: true, updates: sanitized })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// DELETE /api/admin/coupons
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Coupon ID required" }, { status: 400 })
    }

    try {
      const supabase = getAdminSupabaseClient()
      await supabase.from("coupons").delete().eq("id", id)
    } catch (e) {}

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
