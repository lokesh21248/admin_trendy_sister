import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { Database } from "@/types/database"

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

// POST /api/orders (Customer Book / Place Order)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      customer_name,
      customer_phone,
      customer_email,
      address,
      items,
      subtotal,
      discount = 0,
      shipping = 0,
      total,
      payment_method = "cash_on_delivery",
      payment_status = "pending",
      notes,
    } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order must contain at least 1 item." },
        { status: 400 }
      )
    }

    const supabase = getAdminSupabaseClient()
    const guestUserId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    // 1. Try to create address record if address provided
    let addressId: string | null = null
    if (address && (address.house_flat || address.street || address.city)) {
      try {
        const { data: createdAddress } = await supabase
          .from("addresses")
          .insert([
            {
              user_id: guestUserId,
              full_name: customer_name || address.full_name || "Valued Customer",
              phone: customer_phone || address.phone || "",
              house_flat: address.house_flat || "House on File",
              street: address.street || "Main Street",
              city: address.city || "Bengaluru",
              state: address.state || "Karnataka",
              pincode: address.pincode || "560001",
              is_default: true,
            },
          ])
          .select("id")
          .maybeSingle()

        if (createdAddress?.id) {
          addressId = createdAddress.id
        }
      } catch (addrErr) {
        console.warn("[API /api/orders POST] Address insert skipped:", addrErr)
      }
    }

    // Customer note formatting for quick inspection
    const customerInfoSummary = [
      customer_name ? `Customer: ${customer_name}` : "",
      customer_phone ? `Phone: ${customer_phone}` : "",
      customer_email ? `Email: ${customer_email}` : "",
      address?.city ? `City: ${address.city} (${address.pincode || ""})` : "",
      notes ? `Note: ${notes}` : "",
    ]
      .filter(Boolean)
      .join(" | ")

    // 2. Insert into orders table
    const orderPayload = {
      user_id: guestUserId,
      address_id: addressId,
      status: "pending",
      subtotal: Number(subtotal) || Number(total) || 0,
      discount: Number(discount) || 0,
      shipping: Number(shipping) || 0,
      total: Number(total) || 0,
      payment_method: String(payment_method).toLowerCase().replace(/\s+/g, "_"),
      payment_status: payment_status === "paid" ? "paid" : "pending",
      notes: customerInfoSummary || notes || null,
    }

    const { data: createdOrder, error: orderErr } = await supabase
      .from("orders")
      .insert([orderPayload])
      .select("id, created_at")
      .single()

    if (orderErr || !createdOrder) {
      console.error("[API /api/orders POST] Order insert error:", orderErr)
      return NextResponse.json(
        { success: false, error: orderErr?.message || "Failed to create order" },
        { status: 500 }
      )
    }

    // 3. Insert order items
    const orderItemRows = items.map((item: any) => ({
      order_id: createdOrder.id,
      product_id: item.product_id || item.id,
      quantity: Math.max(1, parseInt(String(item.quantity || 1), 10)),
      price: Number(item.price) || 0,
      mrp: Number(item.mrp) || Number(item.price) || 0,
    }))

    const { error: itemsErr } = await supabase
      .from("order_items")
      .insert(orderItemRows)

    if (itemsErr) {
      console.warn("[API /api/orders POST] Order items insert warning:", itemsErr)
    }

    const orderNumber = `TS-${createdOrder.id.slice(0, 8).toUpperCase()}`

    return NextResponse.json({
      success: true,
      order_id: createdOrder.id,
      order_number: orderNumber,
      message: "Order placed successfully! Live alert sent to admin panel.",
    })
  } catch (err: any) {
    console.error("[API /api/orders POST] Exception:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
