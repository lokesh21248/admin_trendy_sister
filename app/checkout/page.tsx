"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/contexts/CartContext"
import { getSafeImageUrl } from "@/lib/image-utils"
import { ArrowLeft, CreditCard, MapPin, Truck, ShieldCheck, CheckCircle2, Tag, Sparkles } from "lucide-react"

function formatPrice(p: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p)
}

export default function CheckoutPage() {
  const { items, total, itemCount, clearCart } = useCart()
  const [step, setStep] = useState<"address" | "payment" | "success">("address")
  const [loading, setLoading] = useState(false)
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState("")

  // Form State
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [houseFlat, setHouseFlat] = useState("")
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("Bengaluru")
  const [stateName, setStateName] = useState("Karnataka")
  const [pincode, setPincode] = useState("")
  const [notes, setNotes] = useState("")

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery")

  // Coupon State
  const [couponInput, setCouponInput] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState("")

  const subtotal = items.reduce((sum, item) => sum + (item.products?.mrp || 0) * item.quantity, 0)
  const catalogSavings = subtotal - total
  const shipping = total >= 999 ? 0 : 99
  const finalTotal = Math.max(0, total + shipping - couponDiscount)

  const handleApplyCoupon = () => {
    setCouponError("")
    const code = couponInput.trim().toUpperCase()
    if (!code) return

    if (code === "TRENDY40") {
      if (total < 1999) {
        setCouponError("Requires minimum cart value of ₹1,999")
        return
      }
      const disc = Math.min(2000, Math.round(total * 0.4))
      setCouponDiscount(disc)
      setAppliedCoupon("TRENDY40 (40% OFF)")
    } else if (code === "WELCOME15") {
      const disc = Math.min(750, Math.round(total * 0.15))
      setCouponDiscount(disc)
      setAppliedCoupon("WELCOME15 (15% OFF)")
    } else if (code === "FESTIVE500") {
      if (total < 4999) {
        setCouponError("Requires minimum cart value of ₹4,999")
        return
      }
      setCouponDiscount(500)
      setAppliedCoupon("FESTIVE500 (₹500 OFF)")
    } else if (code === "SILK10") {
      const disc = Math.min(1000, Math.round(total * 0.1))
      setCouponDiscount(disc)
      setAppliedCoupon("SILK10 (10% OFF)")
    } else {
      setCouponError("Invalid or expired coupon code")
    }
  }

  const handlePlaceOrder = async () => {
    setLoading(true)
    try {
      const orderPayload = {
        customer_name: `${firstName} ${lastName}`.trim() || "Valued Customer",
        customer_phone: phone || "+91 98401 22849",
        customer_email: email || "customer@trendysisters.com",
        address: {
          full_name: `${firstName} ${lastName}`.trim() || "Valued Customer",
          phone: phone || "+91 98401 22849",
          house_flat: houseFlat || "Flat / House on File",
          street: street || "Main Street",
          city: city || "Bengaluru",
          state: stateName || "Karnataka",
          pincode: pincode || "560001",
        },
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          price: i.products?.price || 0,
          mrp: i.products?.mrp || i.products?.price || 0,
        })),
        subtotal,
        discount: catalogSavings + couponDiscount,
        shipping,
        total: finalTotal,
        payment_method: paymentMethod.toLowerCase().replace(/\s+/g, "_"),
        payment_status: paymentMethod === "Cash on Delivery" ? "pending" : "paid",
        notes: notes || (appliedCoupon ? `Applied Coupon: ${appliedCoupon}` : null),
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      })

      const data = await res.json()
      if (data.success) {
        setConfirmedOrderNumber(data.order_number)
        clearCart()
        setStep("success")
      } else {
        alert(data.error || "Failed to place order. Please try again.")
      }
    } catch (err: any) {
      console.error("Order placement error:", err)
      alert("Error contacting server. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  if (itemCount === 0 && step !== "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-ivory">
        <div className="text-center">
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">Your cart is empty</h2>
          <Link href="/shop" className="btn-primary inline-flex">Return to Shop</Link>
        </div>
      </div>
    )
  }

  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-ivory">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-[var(--border)] shadow-lg max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-700" />
          </div>
          <h1 className="font-serif text-2xl lg:text-3xl font-bold text-charcoal mb-3">Order Confirmed!</h1>
          <p className="text-sm text-[#9B8A7A] mb-4">
            Thank you for shopping with Trendy Sisters. Your order <span className="font-mono text-[#651F35] font-bold text-base">{confirmedOrderNumber || "TS-CONFIRMED"}</span> has been placed successfully and received in our fulfillment queue.
          </p>
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DCC8] text-xs text-[#6B5E51] mb-8 space-y-1 text-left">
            <div><strong className="text-[#25201D]">Customer:</strong> {firstName} {lastName} ({phone})</div>
            <div><strong className="text-[#25201D]">Delivery Address:</strong> {houseFlat}, {street}, {city} - {pincode}</div>
            <div><strong className="text-[#25201D]">Payment:</strong> {paymentMethod} · {formatPrice(finalTotal)}</div>
          </div>
          <div className="space-y-3">
            <Link href="/admin/orders" className="btn-primary w-full block py-3.5">
              View in Admin Fulfillment Queue →
            </Link>
            <Link href="/" className="block py-3.5 text-sm font-semibold text-charcoal border border-[var(--border)] rounded-xl hover:bg-ivory transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: "var(--ivory)" }} className="min-h-screen pb-20 lg:pb-8">
      {/* Checkout Header */}
      <div className="bg-white border-b border-[var(--border)] py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 flex items-center justify-between">
          <Link href="/cart" className="flex items-center gap-2 text-sm font-medium text-charcoal hover:text-burgundy transition-colors">
            <ArrowLeft size={16} /> Back to Cart
          </Link>
          <div className="font-serif font-bold text-xl text-burgundy">Trendy Sisters</div>
          <div className="flex items-center gap-1 text-xs text-[#9B8A7A]">
            <ShieldCheck size={14} className="text-green-600" /> 100% Secure Checkout
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Checkout Area */}
          <div className="flex-1 lg:max-w-2xl">
            {/* Steps Indicator */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === "address" ? "bg-burgundy text-white" : "bg-green-600 text-white"}`}>
                  {step === "payment" ? <CheckCircle2 size={14} /> : "1"}
                </div>
                <span className={`text-sm font-bold ${step === "address" ? "text-charcoal" : "text-green-600"}`}>Shipping Address</span>
              </div>
              <div className="w-12 h-0.5 bg-[var(--border)]" />
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === "payment" ? "bg-burgundy text-white" : "bg-gray-200 text-gray-600"}`}>
                  2
                </div>
                <span className={`text-sm font-bold ${step === "payment" ? "text-charcoal" : "text-[#9B8A7A]"}`}>Payment & Confirmation</span>
              </div>
            </div>

            {step === "address" && (
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[var(--border)] shadow-sm animate-fade-in">
                <h2 className="font-serif text-xl font-bold text-charcoal mb-6 flex items-center gap-2">
                  <MapPin size={20} className="text-burgundy" /> Shipping & Customer Details
                </h2>
                
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setStep("payment"); }}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1.5">First Name *</label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm border border-[var(--border)] bg-ivory focus:border-burgundy outline-none transition-colors"
                        placeholder="e.g. Priya"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1.5">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm border border-[var(--border)] bg-ivory focus:border-burgundy outline-none transition-colors"
                        placeholder="e.g. Sundaram"
                      />
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1.5">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm border border-[var(--border)] bg-ivory focus:border-burgundy outline-none transition-colors"
                        placeholder="+91 98401 22849"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm border border-[var(--border)] bg-ivory focus:border-burgundy outline-none transition-colors"
                        placeholder="priya@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1.5">Flat / House / Building *</label>
                    <input
                      type="text"
                      required
                      value={houseFlat}
                      onChange={(e) => setHouseFlat(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm border border-[var(--border)] bg-ivory focus:border-burgundy outline-none transition-colors"
                      placeholder="Villa 14, Lotus Springs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1.5">Street / Area / Colony *</label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm border border-[var(--border)] bg-ivory focus:border-burgundy outline-none transition-colors"
                      placeholder="Kalyan Nagar, Outer Ring Road"
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1.5">City *</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm border border-[var(--border)] bg-ivory focus:border-burgundy outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1.5">State *</label>
                      <input
                        type="text"
                        required
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm border border-[var(--border)] bg-ivory focus:border-burgundy outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1.5">PIN Code *</label>
                      <input
                        type="text"
                        required
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm border border-[var(--border)] bg-ivory focus:border-burgundy outline-none transition-colors"
                        placeholder="560043"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1.5">Delivery Instructions (Optional)</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm border border-[var(--border)] bg-ivory focus:border-burgundy outline-none transition-colors"
                      placeholder="e.g. Please ring bell twice or leave with security"
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full py-4 mt-6 text-sm font-bold">
                    Continue to Payment Method →
                  </button>
                </form>
              </div>
            )}

            {step === "payment" && (
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[var(--border)] shadow-sm animate-fade-in">
                <h2 className="font-serif text-xl font-bold text-charcoal mb-6 flex items-center gap-2">
                  <CreditCard size={20} className="text-burgundy" /> Choose Payment Method
                </h2>

                <div className="space-y-3 mb-8">
                  {[
                    { label: "Cash on Delivery", desc: "Pay with cash or UPI upon delivery" },
                    { label: "UPI (Google Pay, PhonePe, Paytm)", desc: "Instant secure UPI QR payment" },
                    { label: "Credit / Debit Card", desc: "Visa, MasterCard, RuPay, Amex" },
                    { label: "Net Banking", desc: "All major Indian banks supported" },
                  ].map((method) => (
                    <label
                      key={method.label}
                      onClick={() => setPaymentMethod(method.label)}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        paymentMethod === method.label
                          ? "border-burgundy bg-burgundy/5"
                          : "border-[var(--border)] hover:bg-ivory"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        className="w-4 h-4 text-burgundy focus:ring-burgundy mt-1"
                        checked={paymentMethod === method.label}
                        onChange={() => setPaymentMethod(method.label)}
                      />
                      <div>
                        <span className="font-semibold text-sm text-charcoal block">{method.label}</span>
                        <span className="text-xs text-[#8C8074]">{method.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep("address")}
                    className="px-6 py-4 rounded-xl font-bold text-sm text-charcoal border border-[var(--border)] hover:bg-ivory transition-colors cursor-pointer"
                  >
                    Back to Address
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 btn-primary py-4 text-sm font-bold flex justify-center items-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      `Confirm & Place Order • ${formatPrice(finalTotal)}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-[400px]">
            <div className="bg-white rounded-3xl p-6 border border-[var(--border)] shadow-sm sticky top-24 space-y-5">
              <h3 className="font-serif text-lg font-bold text-charcoal">Order Summary</h3>
              
              {/* Promo Coupon Box */}
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DCC8] space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#651F35]">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Have a Promo Coupon?</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. TRENDY40"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#D8CFBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37] uppercase font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-3.5 py-2 rounded-xl bg-[#651F35] text-white text-xs font-bold hover:bg-[#501829] cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Coupon applied: {appliedCoupon}</span>
                  </div>
                )}
                {couponError && (
                  <div className="text-xs text-rose-600 font-medium">{couponError}</div>
                )}
              </div>

              {/* Small item list */}
              <div className="space-y-4 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => {
                  const p = item.products
                  const img = p?.product_images?.[0]?.image_url
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-ivory-dark flex-shrink-0">
                        {img && <Image src={getSafeImageUrl(img)} alt="" fill className="object-cover" sizes="64px" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-charcoal line-clamp-2 mb-1">{p?.name}</p>
                        <p className="text-xs text-[#9B8A7A]">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-burgundy mt-1">{formatPrice(p?.price || 0)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Totals */}
              <div className="space-y-2.5 pt-4 border-t border-[var(--border)]">
                <div className="flex justify-between text-sm">
                  <span className="text-[#9B8A7A]">Subtotal ({itemCount} items)</span>
                  <span className="text-charcoal font-medium">{formatPrice(subtotal)}</span>
                </div>
                {catalogSavings > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#9B8A7A]">Catalog Discount</span>
                    <span className="text-gold font-bold">-{formatPrice(catalogSavings)}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-700 font-medium">Coupon Savings</span>
                    <span className="text-emerald-700 font-bold">-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[#9B8A7A]">Shipping</span>
                  <span className={shipping === 0 ? "text-green-600 font-medium" : "text-charcoal"}>
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-end pt-4 border-t border-[var(--border)]">
                <div>
                  <span className="block text-sm font-bold text-charcoal">Total Amount</span>
                  <span className="text-[10px] text-[#9B8A7A]">Inclusive of all taxes</span>
                </div>
                <span className="text-xl font-serif font-bold text-burgundy">{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
