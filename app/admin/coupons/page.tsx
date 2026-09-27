"use client"

import React, { useState, useMemo } from "react"
import { useAdmin } from "@/contexts/AdminContext"
import {
  TicketPercent,
  Plus,
  Copy,
  Check,
  Edit,
  Trash2,
  Calendar,
  Sparkles,
  TrendingUp,
  Tag,
  Clock,
  ShieldCheck,
  X,
  IndianRupee,
  Percent,
  Search,
} from "lucide-react"
import { AdminCoupon } from "@/types/admin"

export default function AdminCouponsPage() {
  const { coupons, createCoupon, updateCoupon, deleteCoupon, toggleCouponStatus } = useAdmin()

  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null)
  const [form, setForm] = useState<{
    code: string
    description: string
    discount_type: "percentage" | "fixed"
    discount_value: number | string
    min_order_value: number | string
    max_discount_amount: number | string
    usage_limit: number | string
    expires_at: string
    is_active: boolean
  }>({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: 15,
    min_order_value: 999,
    max_discount_amount: 1000,
    usage_limit: 100,
    expires_at: "",
    is_active: true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const openCreateModal = () => {
    setEditingCoupon(null)
    setForm({
      code: "",
      description: "",
      discount_type: "percentage",
      discount_value: 20,
      min_order_value: 1499,
      max_discount_amount: 1500,
      usage_limit: 250,
      expires_at: "",
      is_active: true,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (coupon: AdminCoupon) => {
    setEditingCoupon(coupon)
    setForm({
      code: coupon.code,
      description: coupon.description || "",
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_value: coupon.min_order_value,
      max_discount_amount: coupon.max_discount_amount || "",
      usage_limit: coupon.usage_limit || "",
      expires_at: coupon.expires_at ? coupon.expires_at.split("T")[0] : "",
      is_active: coupon.is_active,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload: Partial<AdminCoupon> = {
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || null,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value) || 0,
        min_order_value: Number(form.min_order_value) || 0,
        max_discount_amount: form.max_discount_amount ? Number(form.max_discount_amount) : null,
        usage_limit: form.usage_limit ? parseInt(String(form.usage_limit), 10) : null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        is_active: form.is_active,
      }

      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, payload)
      } else {
        await createCoupon(payload)
      }
      setIsModalOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      if (filter === "active" && !c.is_active) return false
      if (filter === "inactive" && c.is_active) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchCode = c.code.toLowerCase().includes(q)
        const matchDesc = c.description?.toLowerCase().includes(q)
        if (!matchCode && !matchDesc) return false
      }
      return true
    })
  }, [coupons, filter, search])

  const activeCount = coupons.filter((c) => c.is_active).length
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.times_used || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#181214] via-[#2A161F] to-[#451424] text-white p-6 md:p-8 border border-[#D4AF37]/30 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Promotions & Campaigns</span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#FFF9EF]">
              Coupons & Discount Vouchers
            </h2>
            <p className="text-sm text-[#D8CFBC] leading-relaxed">
              Create and manage promo discount codes for customer marketing campaigns, festive events, and cart abandonment incentives.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B88A3B] hover:from-[#E5C158] hover:to-[#C99B4C] text-[#181214] font-bold text-sm shadow-lg shadow-[#D4AF37]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#181214]" />
            <span>Create New Coupon</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-[#E8DCC8] shadow-xs">
          <div className="flex items-center justify-between text-[#8B6E32] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Codes</span>
            <div className="p-2 rounded-lg bg-[#FAF7F2] text-emerald-700">
              <TicketPercent className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-[#25201D]">{activeCount} Live</div>
          <div className="text-xs text-[#6B5E51] mt-1">Ready for customer checkout</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#E8DCC8] shadow-xs">
          <div className="flex items-center justify-between text-[#8B6E32] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Coupons</span>
            <div className="p-2 rounded-lg bg-[#FAF7F2] text-[#651F35]">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-[#25201D]">{coupons.length} Total</div>
          <div className="text-xs text-[#6B5E51] mt-1">{coupons.length - activeCount} paused or expired</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#E8DCC8] shadow-xs">
          <div className="flex items-center justify-between text-[#8B6E32] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Redemptions</span>
            <div className="p-2 rounded-lg bg-[#FAF7F2] text-indigo-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-[#25201D]">{totalRedemptions} Uses</div>
          <div className="text-xs text-[#6B5E51] mt-1">Applied across checkout orders</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#E8DCC8] shadow-xs">
          <div className="flex items-center justify-between text-[#8B6E32] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Top Offer</span>
            <div className="p-2 rounded-lg bg-[#FAF7F2] text-[#B88A3B]">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-[#651F35]">TRENDY40</div>
          <div className="text-xs text-[#6B5E51] mt-1">40% Off on orders &gt; ₹1,999</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8DCC8] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C8074] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search coupon code or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] placeholder-[#A89F91] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(["all", "active", "inactive"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                filter === tab
                  ? "bg-[#651F35] text-white"
                  : "bg-[#FAF7F2] text-[#6B5E51] hover:bg-[#F5EDD9]"
              }`}
            >
              {tab === "all" ? `All (${coupons.length})` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCoupons.map((coupon) => {
          const isCopied = copiedId === coupon.id
          const hasExpiry = Boolean(coupon.expires_at)
          const expiryDateStr = coupon.expires_at
            ? new Date(coupon.expires_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "No Expiration"

          return (
            <div
              key={coupon.id}
              className={`bg-white rounded-2xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                coupon.is_active
                  ? "border-[#E8DCC8] hover:border-[#D4AF37] hover:shadow-md"
                  : "border-gray-200 opacity-75 hover:opacity-100"
              }`}
            >
              {/* Top Accent Strip */}
              <div
                className={`h-1.5 w-full ${
                  coupon.is_active
                    ? "bg-gradient-to-r from-[#D4AF37] via-[#B88A3B] to-[#651F35]"
                    : "bg-gray-300"
                }`}
              />

              <div className="p-5 space-y-4 flex-1">
                {/* Code & Active Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold tracking-wider px-3 py-1 rounded-xl bg-[#FAF7F2] border border-[#D4AF37]/50 text-[#651F35] shadow-xs">
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => handleCopy(coupon.id, coupon.code)}
                      title="Copy code"
                      className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F5EDD9] text-[#6B5E51] transition-colors cursor-pointer"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => toggleCouponStatus(coupon.id)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                      coupon.is_active
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {coupon.is_active ? "● LIVE" : "○ PAUSED"}
                  </button>
                </div>

                {/* Discount Display */}
                <div>
                  <div className="text-2xl font-serif font-bold text-[#25201D]">
                    {coupon.discount_type === "percentage"
                      ? `${coupon.discount_value}% OFF`
                      : `₹${coupon.discount_value.toLocaleString("en-IN")} FLAT OFF`}
                  </div>
                  {coupon.description && (
                    <p className="text-xs text-[#6B5E51] mt-1 line-clamp-2 leading-relaxed">
                      {coupon.description}
                    </p>
                  )}
                </div>

                {/* Offer Terms */}
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#F0E6D8] space-y-1.5 text-xs text-[#6B5E51]">
                  <div className="flex items-center justify-between">
                    <span>Min Cart Amount:</span>
                    <strong className="text-[#25201D]">
                      {coupon.min_order_value > 0
                        ? `₹${coupon.min_order_value.toLocaleString("en-IN")}`
                        : "No Minimum"}
                    </strong>
                  </div>
                  {coupon.max_discount_amount && (
                    <div className="flex items-center justify-between">
                      <span>Max Discount Cap:</span>
                      <strong className="text-[#25201D]">
                        ₹{coupon.max_discount_amount.toLocaleString("en-IN")}
                      </strong>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Times Redeemed:</span>
                    <strong className="text-[#651F35]">
                      {coupon.times_used} {coupon.usage_limit ? `/ ${coupon.usage_limit}` : "uses"}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[#E8DCC8]/60 text-[11px] text-[#8C8074]">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#B88A3B]" />
                      <span>{expiryDateStr}</span>
                    </div>
                  </div>
                </div>
              </div>

                {/* Actions Footer */}
                <div className="p-4 bg-[#FAF7F2]/50 border-t border-[#F0E6D8] flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#8C8074]">
                  {coupon.discount_type === "percentage" ? "Percentage Discount" : "Flat Amount"}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(coupon)}
                    className="p-1.5 rounded-lg text-[#6B5E51] hover:text-[#651F35] hover:bg-white transition-colors cursor-pointer"
                    title="Edit Coupon"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete coupon "${coupon.code}"?`)) {
                        deleteCoupon(coupon.id)
                      }
                    }}
                    className="p-1.5 rounded-lg text-[#6B5E51] hover:text-rose-600 hover:bg-white transition-colors cursor-pointer"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredCoupons.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E8DCC8] shadow-xs space-y-3">
          <TicketPercent className="w-12 h-12 text-[#B88A3B] mx-auto opacity-70" />
          <h3 className="font-serif text-lg font-bold text-[#25201D]">No Coupons Found</h3>
          <p className="text-xs text-[#6B5E51]">
            Create a promotional code to offer your customers discounts during checkout.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-2 px-4 py-2 rounded-xl bg-[#651F35] text-white text-xs font-semibold hover:bg-[#501829] cursor-pointer"
          >
            Create First Coupon
          </button>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E8DCC8] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="p-6 border-b border-[#F0E6D8] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#25201D]">
                  {editingCoupon ? "Edit Promotional Coupon" : "Create New Promotional Coupon"}
                </h3>
                <p className="text-xs text-[#6B5E51] mt-0.5">
                  Configure discount formula, eligibility criteria, and expiration.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-[#6B5E51] hover:bg-[#FAF7F2] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Code */}
              <div>
                <label className="block text-xs font-bold text-[#25201D] mb-1">
                  Coupon Code * (Alphanumeric, Auto Uppercase)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SILK25 or DIWALI500"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CFBC] bg-[#FAF7F2] font-mono font-bold text-sm text-[#651F35] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] uppercase"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#25201D] mb-1">
                  Campaign Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Diwali Silk Saree Special Offer"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CFBC] bg-[#FAF7F2] text-xs text-[#25201D] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              {/* Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#25201D] mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={form.discount_type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        discount_type: e.target.value as "percentage" | "fixed",
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CFBC] bg-white text-xs font-semibold text-[#25201D] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
                  >
                    <option value="percentage">Percentage (%) Off</option>
                    <option value="fixed">Flat Amount (₹) Off</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#25201D] mb-1">
                    Discount Value * ({form.discount_type === "percentage" ? "%" : "₹"})
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={form.discount_type === "percentage" ? 90 : 50000}
                    placeholder="e.g. 20"
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CFBC] bg-[#FAF7F2] text-xs font-bold text-[#25201D] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Min Order & Max Cap */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#25201D] mb-1">
                    Minimum Order Value (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 1999"
                    value={form.min_order_value}
                    onChange={(e) => setForm({ ...form, min_order_value: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CFBC] bg-[#FAF7F2] text-xs text-[#25201D] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#25201D] mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 1500 (optional)"
                    value={form.max_discount_amount}
                    onChange={(e) => setForm({ ...form, max_discount_amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CFBC] bg-[#FAF7F2] text-xs text-[#25201D] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Expiry Date & Usage Limit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#25201D] mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={form.expires_at}
                    onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CFBC] bg-[#FAF7F2] text-xs text-[#25201D] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#25201D] mb-1">
                    Usage Limit (Max Uses)
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder="e.g. 500 uses"
                    value={form.usage_limit}
                    onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CFBC] bg-[#FAF7F2] text-xs text-[#25201D] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Status Switch */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="coupon_active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 text-[#651F35] rounded border-[#D8CFBC] focus:ring-[#D4AF37] cursor-pointer"
                />
                <label htmlFor="coupon_active" className="text-xs font-semibold text-[#25201D] cursor-pointer">
                  Activate this coupon immediately for customer checkout
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#F0E6D8] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#6B5E51] hover:bg-[#FAF7F2] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#651F35] to-[#8B2D47] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingCoupon ? "Save Changes" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
