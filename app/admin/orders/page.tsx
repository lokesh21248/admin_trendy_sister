"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useAdmin } from "@/contexts/AdminContext"
import {
  ShoppingBag,
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  IndianRupee,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Eye,
  Printer,
  Plus,
  X,
  Sparkles,
  ExternalLink,
  Save,
  MessageCircle,
} from "lucide-react"
import { OrderStatus, AdminOrder } from "@/types/admin"

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus, createManualOrder, products } = useAdmin()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)

  // Booking Modal
  const [isBookModalOpen, setIsBookModalOpen] = useState(false)
  const [bookForm, setBookForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    house_flat: "",
    street: "",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    selectedProductId: "",
    quantity: 1,
    payment_method: "Cash on Delivery",
    payment_status: "pending" as AdminOrder["payment_status"],
    notes: "",
  })
  const [isBooking, setIsBooking] = useState(false)

  // Tracking details state for selected order
  const [trackingNumber, setTrackingNumber] = useState("")
  const [courierPartner, setCourierPartner] = useState("Blue Dart")
  const [adminNote, setAdminNote] = useState("")

  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatOrderDate = (created_at: string) => {
    if (!created_at) return "—"
    if (!isMounted) {
      const d = new Date(created_at)
      if (isNaN(d.getTime())) return "—"
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
    }
    return new Date(created_at).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchNumber = o.order_number?.toLowerCase().includes(q)
        const matchCustomer = o.customer_name?.toLowerCase().includes(q)
        const matchCity = o.address?.city?.toLowerCase().includes(q)
        const matchPhone = o.customer_phone?.toLowerCase().includes(q)
        if (!matchNumber && !matchCustomer && !matchCity && !matchPhone) return false
      }
      if (statusFilter !== "all" && o.status !== statusFilter) return false
      return true
    })
  }, [orders, search, statusFilter])

  const statusColors: Record<OrderStatus, { bg: string; text: string; border: string }> = {
    pending: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
    confirmed: { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" },
    processing: { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" },
    shipped: { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200" },
    out_for_delivery: { bg: "bg-cyan-50", text: "text-cyan-800", border: "border-cyan-200" },
    delivered: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
    cancelled: { bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200" },
    returned: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" },
  }

  const allStatuses: OrderStatus[] = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "out_for_delivery",
    "delivered",
    "cancelled",
    "returned",
  ]

  const openOrderDetails = (order: AdminOrder) => {
    setSelectedOrder(order)
    setTrackingNumber(order.tracking_number || "")
    setCourierPartner(order.courier_partner || "Blue Dart")
    setAdminNote(order.notes || "")
  }

  const handleSaveTracking = async () => {
    if (!selectedOrder) return
    await updateOrderStatus(selectedOrder.id, selectedOrder.status, selectedOrder.payment_status)
    // Update local selected
    setSelectedOrder({
      ...selectedOrder,
      tracking_number: trackingNumber,
      courier_partner: courierPartner,
      notes: adminNote,
    })
  }

  const handleBookOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsBooking(true)
    try {
      const selectedProd = products.find((p) => p.id === bookForm.selectedProductId) || products[0]
      const price = selectedProd ? selectedProd.price : 4999
      const mrp = selectedProd ? selectedProd.mrp : 6999
      const totalAmount = price * bookForm.quantity

      const payload = {
        customer_name: bookForm.customer_name.trim() || "Customer Booking",
        customer_phone: bookForm.customer_phone.trim(),
        customer_email: bookForm.customer_email.trim() || "manual_booking@trendysisters.com",
        address: {
          full_name: bookForm.customer_name.trim(),
          phone: bookForm.customer_phone.trim(),
          house_flat: bookForm.house_flat || "Address on File",
          street: bookForm.street || "Main Road",
          city: bookForm.city || "Bengaluru",
          state: bookForm.state || "Karnataka",
          pincode: bookForm.pincode || "560001",
        },
        items: [
          {
            product_id: selectedProd?.id || "manual-prod",
            quantity: bookForm.quantity,
            price,
            mrp,
          },
        ],
        subtotal: totalAmount,
        discount: 0,
        shipping: 0,
        total: totalAmount,
        payment_method: bookForm.payment_method.toLowerCase().replace(/\s+/g, "_"),
        payment_status: bookForm.payment_status,
        notes: bookForm.notes ? `[Admin Manual Booking] ${bookForm.notes}` : "[Admin Manual Booking via Phone/WhatsApp]",
      }

      const success = await createManualOrder(payload)
      if (success) {
        setIsBookModalOpen(false)
        setBookForm({
          customer_name: "",
          customer_phone: "",
          customer_email: "",
          house_flat: "",
          street: "",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560001",
          selectedProductId: "",
          quantity: 1,
          payment_method: "Cash on Delivery",
          payment_status: "pending",
          notes: "",
        })
      }
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Title & Live Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-serif text-2xl font-bold text-[#25201D]">
              Order Fulfillment & Logistics
            </h2>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Database Sync</span>
            </div>
          </div>
          <p className="text-xs text-[#6B5E51]">
            Real-time customer order queue, shipment dispatch tracking, and address reconciliations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBookModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#651F35] to-[#8B2D47] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Book Customer Order</span>
          </button>

          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-[#E8DCC8] shadow-xs text-xs font-semibold text-[#651F35]">
            <span>{orders.length} Total Orders</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8DCC8] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C8074] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order number (TS-...), customer name, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] placeholder-[#A89F91] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === "all"
                ? "bg-[#651F35] text-white"
                : "bg-[#FAF7F2] text-[#6B5E51] hover:bg-[#F5EDD9]"
            }`}
          >
            All Orders ({orders.length})
          </button>
          {allStatuses.map((st) => {
            const count = orders.filter((o) => o.status === st).length
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap capitalize transition-colors cursor-pointer ${
                  statusFilter === st
                    ? "bg-[#651F35] text-white"
                    : "bg-[#FAF7F2] text-[#6B5E51] hover:bg-[#F5EDD9]"
                }`}
              >
                {st.replace(/_/g, " ")} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E8DCC8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#25201D]">
            <thead className="text-[11px] uppercase tracking-wider text-[#8B6E32] bg-[#FAF7F2] border-b border-[#E8DCC8]">
              <tr>
                <th className="py-3 px-4">Order Ref & Date</th>
                <th className="py-3 px-3">Customer & Destination</th>
                <th className="py-3 px-3">Saree Items</th>
                <th className="py-3 px-3">Financials</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Fulfillment Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E6D8]">
              {filteredOrders.map((order) => {
                const color = statusColors[order.status] || statusColors.pending
                const dateStr = formatOrderDate(order.created_at)

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-[#FAF7F2]/60 transition-colors"
                  >
                    {/* Order Ref & Date */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-xs text-[#651F35]">
                        {order.order_number}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-[#8C8074] mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span suppressHydrationWarning>{dateStr}</span>
                      </div>
                    </td>

                    {/* Customer & Destination */}
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-xs text-[#25201D]">
                        {order.customer_name}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-[#6B5E51] mt-0.5">
                        <MapPin className="w-3 h-3 text-[#B88A3B]" />
                        <span>
                          {order.address?.city || "Bengaluru"}, {order.address?.state || "Karnataka"} (
                          {order.address?.pincode || "560001"})
                        </span>
                      </div>
                      <div className="text-[10px] text-[#8C8074] mt-0.5">
                        {order.customer_phone}
                      </div>
                    </td>

                    {/* Saree Items */}
                    <td className="py-3.5 px-3">
                      <div className="space-y-1 max-w-[220px]">
                        {(order.order_items || []).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2"
                          >
                            {item.product_image && (
                              <img
                                src={item.product_image}
                                alt=""
                                className="w-6 h-8 rounded object-cover border border-[#E8DCC8] shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <div className="text-xs text-[#25201D] font-medium truncate">
                                {item.product_name}
                              </div>
                              <div className="text-[10px] text-[#8C8074]">
                                Qty: {item.quantity} · ₹
                                {item.price.toLocaleString("en-IN")}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Financials */}
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-xs text-[#25201D]">
                        {formatPrice(order.total)}
                      </div>
                      {order.discount > 0 && (
                        <div className="text-[10px] text-emerald-700">
                          Discount: -{formatPrice(order.discount)}
                        </div>
                      )}
                      <div className="text-[10px] text-[#8C8074]">
                        Shipping:{" "}
                        {order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}
                      </div>
                    </td>

                    {/* Payment Badge */}
                    <td className="py-3.5 px-3">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            order.payment_status === "paid"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                              : order.payment_status === "failed"
                              ? "bg-rose-50 text-rose-800 border border-rose-300"
                              : "bg-amber-50 text-amber-800 border border-amber-300"
                          }`}
                        >
                          {order.payment_status.toUpperCase()}
                        </span>
                        <div className="text-[10px] font-medium text-[#6B5E51]">
                          {order.payment_method}
                        </div>
                      </div>
                    </td>

                    {/* Fulfillment Status Dropdown */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(
                              order.id,
                              e.target.value as OrderStatus,
                              order.payment_status
                            )
                          }
                          className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border focus:ring-1 focus:ring-[#D4AF37] focus:outline-none cursor-pointer ${color.bg} ${color.text} ${color.border}`}
                        >
                          {allStatuses.map((st) => (
                            <option key={st} value={st}>
                              {st.replace(/_/g, " ").toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>

                      {order.notes && (
                        <div className="text-[10px] text-[#8C8074] italic mt-1 max-w-[180px] truncate" title={order.notes}>
                          {order.notes}
                        </div>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F5EDD9] text-[#651F35] font-bold text-xs border border-[#E8DCC8] hover:border-[#D4AF37] transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E8DCC8] shadow-xs space-y-3">
          <Package className="w-12 h-12 text-[#B88A3B] mx-auto opacity-70" />
          <h3 className="font-serif text-lg font-bold text-[#25201D]">No Orders Found</h3>
          <p className="text-xs text-[#6B5E51]">
            No customer orders match your current filter. When a customer places an order on the storefront, it will appear here instantly.
          </p>
          <button
            onClick={() => setIsBookModalOpen(true)}
            className="mt-2 px-4 py-2 rounded-xl bg-[#651F35] text-white text-xs font-semibold hover:bg-[#501829] cursor-pointer"
          >
            Create Customer Order
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ORDER DETAILS & DISPATCH SLIP MODAL */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E8DCC8] shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto custom-scrollbar">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#F0E6D8] flex items-center justify-between bg-gradient-to-r from-[#FAF7F2] to-white">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-extrabold text-[#651F35]">
                    {selectedOrder.order_number}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      statusColors[selectedOrder.status]?.bg
                    } ${statusColors[selectedOrder.status]?.text} ${statusColors[selectedOrder.status]?.border} border`}
                  >
                    {selectedOrder.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-[#8C8074] mt-1" suppressHydrationWarning>
                  Placed on{" "}
                  <span suppressHydrationWarning>
                    {isMounted
                      ? new Date(selectedOrder.created_at).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "—"}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F5EDD9] text-[#651F35] border border-[#E8DCC8] transition-colors cursor-pointer"
                  title="Print Invoice / Packing Slip"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-xl text-[#6B5E51] hover:bg-[#FAF7F2] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Customer & Address Card */}
              <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8]">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B6E32] block mb-1">
                    Customer Information
                  </span>
                  <h4 className="font-bold text-sm text-[#25201D]">
                    {selectedOrder.customer_name}
                  </h4>
                  <div className="mt-1 space-y-1 text-xs text-[#6B5E51]">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#B88A3B]" />
                      <span>{selectedOrder.customer_phone}</span>
                      <a
                        href={`https://wa.me/${selectedOrder.customer_phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-1 text-emerald-700 font-bold hover:underline inline-flex items-center gap-0.5"
                      >
                        <MessageCircle className="w-3 h-3" /> WhatsApp
                      </a>
                    </div>
                    {selectedOrder.customer_email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#B88A3B]" />
                        <span>{selectedOrder.customer_email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B6E32] block mb-1">
                    Delivery Destination
                  </span>
                  <div className="text-xs text-[#25201D] leading-relaxed">
                    <div>{selectedOrder.address?.house_flat}</div>
                    <div>{selectedOrder.address?.street}</div>
                    <div>
                      {selectedOrder.address?.city}, {selectedOrder.address?.state} -{" "}
                      <strong>{selectedOrder.address?.pincode}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8B6E32] mb-3">
                  Purchased Saree Items ({selectedOrder.order_items?.length || 0})
                </h4>
                <div className="divide-y divide-[#F0E6D8] border border-[#E8DCC8] rounded-xl overflow-hidden">
                  {(selectedOrder.order_items || []).map((item) => (
                    <div key={item.id} className="p-3.5 flex items-center gap-3 bg-white">
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt=""
                          className="w-12 h-16 rounded-lg object-cover border border-[#E8DCC8] shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-16 rounded-lg bg-[#FAF7F2] border border-[#E8DCC8] flex items-center justify-center text-xs text-[#8C8074]">
                          Saree
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-xs text-[#25201D] truncate">
                          {item.product_name}
                        </h5>
                        <div className="text-[11px] text-[#6B5E51] mt-0.5">
                          Unit Price: ₹{item.price.toLocaleString("en-IN")} · Qty: {item.quantity}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-xs text-[#25201D]">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] space-y-2 text-xs">
                <div className="flex justify-between text-[#6B5E51]">
                  <span>Subtotal</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Applied Discount</span>
                    <span>-{formatPrice(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#6B5E51]">
                  <span>Shipping Fee</span>
                  <span>{selectedOrder.shipping === 0 ? "FREE" : formatPrice(selectedOrder.shipping)}</span>
                </div>
                <div className="pt-2 border-t border-[#E8DCC8] flex justify-between font-bold text-sm text-[#25201D]">
                  <span>Final Total</span>
                  <span className="text-[#651F35] font-serif text-base">{formatPrice(selectedOrder.total)}</span>
                </div>
                <div className="text-[11px] text-[#8C8074]">
                  Payment: <strong>{selectedOrder.payment_method}</strong> ({selectedOrder.payment_status.toUpperCase()})
                </div>
              </div>

              {/* Fulfillment & Courier Controls */}
              <div className="p-4 rounded-xl border border-[#D4AF37]/50 bg-gradient-to-r from-[#FAF7F2] to-white space-y-4">
                <h4 className="text-xs font-bold text-[#651F35] flex items-center gap-1.5 uppercase tracking-wider">
                  <Truck className="w-4 h-4 text-[#B88A3B]" />
                  <span>Shipment & Dispatch Tracking</span>
                </h4>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#25201D] mb-1">
                      Fulfillment Status
                    </label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as OrderStatus
                        updateOrderStatus(selectedOrder.id, newStatus, selectedOrder.payment_status)
                        setSelectedOrder({ ...selectedOrder, status: newStatus })
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-[#D8CFBC] bg-white text-xs font-bold text-[#25201D] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
                    >
                      {allStatuses.map((st) => (
                        <option key={st} value={st}>
                          {st.replace(/_/g, " ").toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#25201D] mb-1">
                      Payment Status
                    </label>
                    <select
                      value={selectedOrder.payment_status}
                      onChange={(e) => {
                        const newPayment = e.target.value as AdminOrder["payment_status"]
                        updateOrderStatus(selectedOrder.id, selectedOrder.status, newPayment)
                        setSelectedOrder({ ...selectedOrder, payment_status: newPayment })
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-[#D8CFBC] bg-white text-xs font-bold text-[#25201D] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
                    >
                      <option value="pending">PENDING</option>
                      <option value="paid">PAID</option>
                      <option value="refunded">REFUNDED</option>
                      <option value="failed">FAILED</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#25201D] mb-1">
                      Courier Partner
                    </label>
                    <select
                      value={courierPartner}
                      onChange={(e) => setCourierPartner(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D8CFBC] bg-white text-xs text-[#25201D] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
                    >
                      <option value="Blue Dart">Blue Dart Express</option>
                      <option value="Delhivery">Delhivery</option>
                      <option value="DTDC">DTDC Courier</option>
                      <option value="India Post">India Post Speed Post</option>
                      <option value="Xpressbees">Xpressbees</option>
                      <option value="Shadowfax">Shadowfax</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#25201D] mb-1">
                      Tracking / AWB Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BD99218204"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D8CFBC] bg-white text-xs font-mono text-[#25201D] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#25201D] mb-1">
                    Internal Fulfillment Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Packed in double gift wrap with silk pouch."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D8CFBC] bg-white text-xs text-[#25201D] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveTracking}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#651F35] text-white text-xs font-bold hover:bg-[#501829] cursor-pointer transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Tracking & Notes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BOOK CUSTOMER ORDER MODAL (ADMIN MANUAL BOOKING) */}
      {/* ========================================================================= */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E8DCC8] shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="p-6 border-b border-[#F0E6D8] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#25201D]">
                  Book Customer Order Manually
                </h3>
                <p className="text-xs text-[#6B5E51] mt-0.5">
                  Record orders placed via WhatsApp, Phone Call, or Direct Store Inquiries.
                </p>
              </div>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="p-2 rounded-xl text-[#6B5E51] hover:bg-[#FAF7F2] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookOrderSubmit} className="p-6 space-y-4">
              {/* Customer Name & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#25201D] mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kavita Reddy"
                    value={bookForm.customer_name}
                    onChange={(e) => setBookForm({ ...bookForm, customer_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CFBC] bg-[#FAF7F2] text-xs text-[#25201D] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#25201D] mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98401 22849"
                    value={bookForm.customer_phone}
                    onChange={(e) => setBookForm({ ...bookForm, customer_phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CFBC] bg-[#FAF7F2] text-xs text-[#25201D] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-[#25201D] mb-1">
                  Delivery Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Flat No, Apartment, House Name"
                  value={bookForm.house_flat}
                  onChange={(e) => setBookForm({ ...bookForm, house_flat: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D8CFBC] bg-[#FAF7F2] text-xs text-[#25201D] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] mb-2"
                />
                <input
                  type="text"
                  required
                  placeholder="Street, Landmark, Area"
                  value={bookForm.street}
                  onChange={(e) => setBookForm({ ...bookForm, street: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D8CFBC] bg-[#FAF7F2] text-xs text-[#25201D] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#25201D] mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={bookForm.city}
                    onChange={(e) => setBookForm({ ...bookForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D8CFBC] bg-[#FAF7F2] text-xs text-[#25201D] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#25201D] mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={bookForm.state}
                    onChange={(e) => setBookForm({ ...bookForm, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D8CFBC] bg-[#FAF7F2] text-xs text-[#25201D] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#25201D] mb-1">PIN Code</label>
                  <input
                    type="text"
                    required
                    placeholder="560001"
                    value={bookForm.pincode}
                    onChange={(e) => setBookForm({ ...bookForm, pincode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D8CFBC] bg-[#FAF7F2] text-xs text-[#25201D] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Saree Selection */}
              <div>
                <label className="block text-xs font-bold text-[#25201D] mb-1">
                  Select Saree from Catalog *
                </label>
                <select
                  value={bookForm.selectedProductId}
                  onChange={(e) => setBookForm({ ...bookForm, selectedProductId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CFBC] bg-white text-xs font-medium text-[#25201D] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
                >
                  <option value="">-- Choose Saree from Inventory --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · ₹{p.price.toLocaleString("en-IN")} ({p.fabric || "Silk"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity & Payment Method */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#25201D] mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={bookForm.quantity}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, quantity: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CFBC] bg-[#FAF7F2] text-xs font-bold text-[#25201D] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#25201D] mb-1">Payment Method</label>
                  <select
                    value={bookForm.payment_method}
                    onChange={(e) => setBookForm({ ...bookForm, payment_method: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CFBC] bg-white text-xs text-[#25201D] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
                  >
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="UPI">UPI (GPay / PhonePe)</option>
                    <option value="Credit / Debit Card">Credit / Debit Card</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#25201D] mb-1">
                  Booking Note / Channel
                </label>
                <input
                  type="text"
                  placeholder="e.g. Customer ordered via WhatsApp chat. Wants delivery by Friday."
                  value={bookForm.notes}
                  onChange={(e) => setBookForm({ ...bookForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D8CFBC] bg-[#FAF7F2] text-xs text-[#25201D] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-[#F0E6D8] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#6B5E51] hover:bg-[#FAF7F2] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBooking}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#651F35] to-[#8B2D47] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {isBooking ? "Booking Order in Database..." : "Confirm & Book Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
