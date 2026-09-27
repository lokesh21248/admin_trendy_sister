import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { Database } from "@/types/database"
import { AdminOrder, OrderStatus } from "@/types/admin"

export const dynamic = "force-dynamic"
export const revalidate = 0

function getAdminSupabaseClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://efirqiluvuerurnpptfm.supabase.co"
  const apiKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_xHWxpegsG3AQTZt4mqubiQ_it5Go61G"

  return createSupabaseClient<Database>(supabaseUrl, apiKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// GET /api/admin/orders
export async function GET(req: NextRequest) {
  try {
    const supabase = getAdminSupabaseClient()
    const { data: dbOrders, error } = await supabase
      .from("orders")
      .select(`
        *,
        addresses (*),
        order_items (
          *,
          products (
            id,
            name,
            price,
            mrp,
            product_images (image_url, is_primary, sort_order)
          )
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[API /api/admin/orders GET] Error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const mappedOrders: AdminOrder[] = (dbOrders || []).map((o: any) => {
      const addr = o.addresses || {}
      return {
        id: o.id,
        order_number: `TS-${o.id.slice(0, 8).toUpperCase()}`,
        user_id: o.user_id,
        customer_name: addr.full_name || "Online Customer",
        customer_email: addr.email || "customer@trendysisters.com",
        customer_phone: addr.phone || "+91 98401 00000",
        address: {
          full_name: addr.full_name || "Online Customer",
          phone: addr.phone || "+91 98401 00000",
          house_flat: addr.house_flat || "Online Delivery",
          street: addr.street || "Main Street",
          city: addr.city || "Bengaluru",
          state: addr.state || "Karnataka",
          pincode: addr.pincode || "560001",
        },
        status: (o.status as OrderStatus) || "pending",
        subtotal: Number(o.subtotal) || Number(o.total) || 0,
        discount: Number(o.discount) || 0,
        shipping: Number(o.shipping) || 0,
        total: Number(o.total) || 0,
        payment_method:
          o.payment_method === "cash_on_delivery"
            ? "Cash on Delivery"
            : o.payment_method === "upi"
            ? "UPI"
            : o.payment_method === "card"
            ? "Card"
            : o.payment_method === "net_banking"
            ? "Net Banking"
            : "Cash on Delivery",
        payment_status: (o.payment_status as AdminOrder["payment_status"]) || "pending",
        notes: o.notes || null,
        created_at: o.created_at,
        updated_at: o.updated_at,
        order_items: (o.order_items || []).map((it: any) => {
          const prod = it.products || {}
          const primaryImg =
            prod.product_images?.find((img: any) => img.is_primary)?.image_url ||
            prod.product_images?.[0]?.image_url ||
            ""
          return {
            id: it.id,
            order_id: it.order_id,
            product_id: it.product_id,
            product_name: prod.name || "Traditional Saree",
            product_image: primaryImg,
            quantity: it.quantity || 1,
            price: Number(it.price) || 0,
            mrp: Number(it.mrp) || Number(it.price) || 0,
          }
        }),
      }
    })

    return NextResponse.json(
      { success: true, orders: mappedOrders },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    )
  } catch (err: any) {
    console.error("[API /api/admin/orders GET] Exception:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// PATCH /api/admin/orders (Update order status)
export async function PATCH(req: NextRequest) {
  try {
    const { orderId, status, paymentStatus } = await req.json()

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: "orderId and status are required" },
        { status: 400 }
      )
    }

    const supabase = getAdminSupabaseClient()
    const updates: any = {
      status,
      updated_at: new Date().toISOString(),
    }
    if (paymentStatus) {
      updates.payment_status = paymentStatus
    }

    const { error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", orderId)

    if (error) {
      console.error("[API /api/admin/orders PATCH] Error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("[API /api/admin/orders PATCH] Exception:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
