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

      let parsedName = addr.full_name || ""
      let parsedPhone = addr.phone || ""
      let parsedEmail = addr.email || ""
      let parsedHouse = addr.house_flat || ""
      let parsedStreet = addr.street || ""
      let parsedCity = addr.city || ""
      let parsedState = addr.state || ""
      let parsedPincode = addr.pincode || ""

      // If address table didn't have info, parse from notes if available
      if (o.notes && (!parsedName || !parsedPhone)) {
        const parts = String(o.notes).split("|").map((s) => s.trim())
        for (const p of parts) {
          if (p.startsWith("Customer:") && !parsedName) parsedName = p.replace("Customer:", "").trim()
          if (p.startsWith("Phone:") && !parsedPhone) parsedPhone = p.replace("Phone:", "").trim()
          if (p.startsWith("Email:") && !parsedEmail) parsedEmail = p.replace("Email:", "").trim()
          if (p.startsWith("City:") && !parsedCity) parsedCity = p.replace("City:", "").trim()
          if (p.startsWith("Address:") && !parsedHouse) parsedHouse = p.replace("Address:", "").trim()
        }
      }

      const hasMissingDetails = !parsedName && !parsedPhone && !parsedHouse

      return {
        id: o.id,
        order_number: `TS-${o.id.slice(0, 8).toUpperCase()}`,
        user_id: o.user_id,
        customer_name: parsedName || (o.user_id ? `Storefront Customer (${o.user_id.slice(-6)})` : "Storefront Customer"),
        customer_email: parsedEmail || (o.user_id ? `${o.user_id.slice(-6)}@trendysisters.com` : "customer@trendysisters.com"),
        customer_phone: parsedPhone || "Not provided",
        has_missing_details: hasMissingDetails,
        address: {
          full_name: parsedName || "Storefront Customer",
          phone: parsedPhone || "Not provided",
          house_flat: parsedHouse || "Address not provided",
          street: parsedStreet || "",
          city: parsedCity || "Bengaluru",
          state: parsedState || "Karnataka",
          pincode: parsedPincode || "560001",
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

// PATCH /api/admin/orders (Update order status, acceptance, and customer details)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      orderId,
      status,
      paymentStatus,
      customer_name,
      customer_phone,
      customer_email,
      address,
      notes,
    } = body

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId is required" },
        { status: 400 }
      )
    }

    const supabase = getAdminSupabaseClient()
    const updates: any = {
      updated_at: new Date().toISOString(),
    }
    if (status) updates.status = status
    if (paymentStatus) updates.payment_status = paymentStatus
    if (notes !== undefined) updates.notes = notes

    // If customer details or address were provided/edited by admin:
    if (customer_name || customer_phone || address) {
      try {
        // Check if order already has an address_id
        const { data: currentOrder } = await supabase
          .from("orders")
          .select("address_id, user_id")
          .eq("id", orderId)
          .single()

        const addressPayload = {
          full_name: customer_name || address?.full_name || "Valued Customer",
          phone: customer_phone || address?.phone || "",
          house_flat: address?.house_flat || "House on File",
          street: address?.street || "Main Road",
          city: address?.city || "Bengaluru",
          state: address?.state || "Karnataka",
          pincode: address?.pincode || "560001",
        }

        if (currentOrder?.address_id) {
          // Update existing address
          await supabase
            .from("addresses")
            .update(addressPayload)
            .eq("id", currentOrder.address_id)
        } else {
          // Create new address record and link it
          const { data: newAddr } = await supabase
            .from("addresses")
            .insert([
              {
                user_id: currentOrder?.user_id || "admin_managed",
                ...addressPayload,
                is_default: true,
              },
            ])
            .select("id")
            .maybeSingle()

          if (newAddr?.id) {
            updates.address_id = newAddr.id
          }
        }

        // Also update notes with formatted customer summary
        const summary = [
          customer_name ? `Customer: ${customer_name}` : "",
          customer_phone ? `Phone: ${customer_phone}` : "",
          customer_email ? `Email: ${customer_email}` : "",
          address?.city ? `City: ${address.city} (${address.pincode || ""})` : "",
          address?.house_flat ? `Address: ${address.house_flat}, ${address.street || ""}` : "",
          notes ? `Notes: ${notes}` : "",
        ]
          .filter(Boolean)
          .join(" | ")

        updates.notes = summary
      } catch (addrErr) {
        console.warn("[API /api/admin/orders PATCH] Error syncing address:", addrErr)
      }
    }

    const { error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", orderId)

    if (error) {
      console.error("[API /api/admin/orders PATCH] Error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, updates })
  } catch (err: any) {
    console.error("[API /api/admin/orders PATCH] Exception:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
