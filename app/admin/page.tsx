"use client"

import React from "react"
import Link from "next/link"
import { useAdmin } from "@/contexts/AdminContext"
import {
  Shirt,
  ShieldCheck,
  ShoppingBag,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Layers,
  Sparkles,
  Palette,
  Camera,
  Tag,
  AlertCircle,
  Plus,
} from "lucide-react"
import { OrderStatus } from "@/types/admin"

export default function AdminDashboardPage() {
  const { products, orders, stats, updateOrderStatus, setSelectedAuditProductId, setAuditFilter } =
    useAdmin()

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const checklistItems = [
    {
      title: "Missing Fabric Material",
      count: stats.checklist.missingFabric,
      filter: "missing-fabric" as const,
      icon: Layers,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      description: "Sarees without specified weave (Silk, Kanjivaram, Cotton)",
    },
    {
      title: "Missing Color Swatches",
      count: stats.checklist.missingColor,
      filter: "missing-color" as const,
      icon: Palette,
      color: "text-purple-600 bg-purple-50 border-purple-200",
      description: "Sarees lacking primary shade & swatch hex mapping",
    },
    {
      title: "Missing Occasion Tags",
      count: stats.checklist.missingOccasion,
      filter: "missing-occasion" as const,
      icon: Tag,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      description: "Sarees unclassified for Wedding, Bridal, Festive, etc.",
    },
    {
      title: "Incomplete Gallery (< 2 angles)",
      count: stats.checklist.missingImages,
      filter: "missing-images" as const,
      icon: Camera,
      color: "text-rose-600 bg-rose-50 border-rose-200",
      description: "Requires at least primary drape + border detail",
    },
    {
      title: "Low Inventory Alert (< 10 units)",
      count: stats.checklist.lowStock,
      filter: "low-stock" as const,
      icon: AlertTriangle,
      color: "text-orange-600 bg-orange-50 border-orange-200",
      description: "Sarees nearing stockout or unassigned units",
    },
    {
      title: "Needs Audit Review (< 100%)",
      count: stats.checklist.needsReview,
      filter: "review" as const,
      icon: AlertCircle,
      color: "text-[#651F35] bg-[#651F35]/10 border-[#651F35]/20",
      description: "Pending full quality sign-off before storefront promotion",
    },
  ]

  const recentOrders = orders.slice(0, 5)
  const recentSarees = products.slice(0, 6)

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8 w-full max-w-full overflow-hidden">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#181214] via-[#2A161F] to-[#451424] text-white p-5 sm:p-6 md:p-8 border border-[#D4AF37]/30 shadow-xl w-full">
        {/* Ambient Gold Radial Glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#D4AF37]/15 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Content Block & CTA Buttons */}
          <div className="space-y-3 sm:space-y-3.5 max-w-2xl flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-[11px] sm:text-xs font-semibold uppercase tracking-wider w-fit">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Trendy Sisters Haute Couture Admin</span>
            </div>

            <h2 className="font-serif text-[clamp(1.35rem,3.2vw,2rem)] font-bold tracking-tight text-[#FFF9EF] leading-tight">
              Welcome back, Lead Merchandiser
            </h2>

            <p className="text-xs sm:text-sm text-[#D8CFBC] leading-relaxed max-w-xl">
              Your saree catalog health is currently at{" "}
              <strong className="text-[#D4AF37] font-semibold">
                {stats.designHealthScore}%
              </strong>
              . Audit pending fabric specs, palette swatches, and high-res angles to ensure supreme customer drape fidelity.
            </p>

            {/* CTA Buttons - Stacked on mobile, side-by-side on tablet/desktop */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1.5">
              <Link
                href="/admin/design-checker"
                className="min-h-[44px] whitespace-nowrap inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B88A3B] hover:from-[#E5C158] hover:to-[#C99B4C] text-[#181214] font-semibold text-xs sm:text-sm shadow-md shadow-[#D4AF37]/20 transition-all active:scale-[0.98] text-center cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#181214] shrink-0" />
                <span>Launch Design Checker</span>
                <ArrowRight className="w-4 h-4 text-[#181214] shrink-0" />
              </Link>

              <Link
                href="/admin/products?action=new"
                className="min-h-[44px] whitespace-nowrap inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs sm:text-sm border border-white/20 transition-all active:scale-[0.98] text-center cursor-pointer"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>Add New Saree</span>
              </Link>
            </div>
          </div>

          {/* Right: Quick Catalog Quality Status Card on Large Screens */}
          <div className="hidden lg:flex flex-col items-end gap-3 shrink-0 pl-6 border-l border-white/10">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs text-right space-y-2 min-w-[210px]">
              <div className="text-[10px] uppercase font-semibold tracking-wider text-[#D4AF37]">
                Catalog Quality Score
              </div>
              <div className="font-serif text-3xl font-bold text-white flex items-center justify-end gap-2">
                <span>{stats.designHealthScore}%</span>
                <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div className="text-[11px] text-[#D8CFBC]">
                {stats.checklist.complete} of {stats.totalSarees} Sarees Ready
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${stats.designHealthScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Core Metric Cards - Responsive across 320px mobile (2-col), tablet (3-col), and desktop (5-col) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2.5 sm:gap-3.5 lg:gap-4 w-full">
        {/* Metric 1: Total Sarees */}
        <div className="bg-white rounded-2xl p-3 sm:p-4.5 border border-[#E8DCC8] shadow-2xs hover:shadow-md transition-shadow w-full flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 text-[#8B6E32] mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">
              Total Sarees
            </span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-[#FAF7F2] text-[#651F35] shrink-0">
              <Shirt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <div className="font-serif text-[clamp(1.2rem,3.5vw,1.5rem)] font-bold text-[#25201D] leading-tight truncate">
              {stats.totalSarees}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[10px] sm:text-xs text-[#6B5E51] truncate">
              <span className="font-semibold text-emerald-600">
                {stats.activeCatalog} Live
              </span>
              <span>·</span>
              <span>{stats.totalSarees - stats.activeCatalog} Draft</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Active Catalog */}
        <div className="bg-white rounded-2xl p-3 sm:p-4.5 border border-[#E8DCC8] shadow-2xs hover:shadow-md transition-shadow w-full flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 text-[#8B6E32] mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">
              Active Catalog
            </span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-[#FAF7F2] text-emerald-600 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <div className="font-serif text-[clamp(1.2rem,3.5vw,1.5rem)] font-bold text-[#25201D] leading-tight truncate">
              {stats.activePercentage}%
            </div>
            <div className="mt-1 text-[10px] sm:text-xs text-[#6B5E51] truncate">
              {stats.activeCatalog} of {stats.totalSarees} in store
            </div>
          </div>
        </div>

        {/* Metric 3: Design Health Score */}
        <div className="bg-white rounded-2xl p-3 sm:p-4.5 border border-[#E8DCC8] shadow-2xs hover:shadow-md transition-shadow w-full flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between gap-1 text-[#8B6E32] mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">
              Design Health
            </span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-[#FAF7F2] text-[#B88A3B] shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <div className="font-serif text-[clamp(1.2rem,3.5vw,1.5rem)] font-bold text-[#651F35] leading-tight truncate">
                {stats.designHealthScore}%
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200 truncate">
                {stats.checklist.complete}/{stats.totalSarees}
              </span>
            </div>
            {/* Visual Mini Progress Bar */}
            <div className="w-full bg-[#FAF7F2] h-1.5 rounded-full mt-2 overflow-hidden border border-[#E8DCC8]">
              <div
                className="h-full bg-gradient-to-r from-[#B88A3B] to-[#651F35] rounded-full transition-all duration-500"
                style={{ width: `${stats.designHealthScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 4: Total Orders */}
        <div className="bg-white rounded-2xl p-3 sm:p-4.5 border border-[#E8DCC8] shadow-2xs hover:shadow-md transition-shadow w-full flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 text-[#8B6E32] mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">
              Total Orders
            </span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-[#FAF7F2] text-indigo-600 shrink-0">
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <div className="font-serif text-[clamp(1.2rem,3.5vw,1.5rem)] font-bold text-[#25201D] leading-tight truncate">
              {stats.totalOrders}
            </div>
            <div className="mt-1 text-[10px] sm:text-xs text-[#6B5E51] truncate">
              <span className="font-semibold text-amber-600">
                {stats.pendingOrdersCount} pending dispatch
              </span>
            </div>
          </div>
        </div>

        {/* Metric 5: Store Revenue (Spans 2 cols on mobile to comfortably fit currency) */}
        <div className="bg-white rounded-2xl p-3 sm:p-4.5 border border-[#E8DCC8] shadow-2xs hover:shadow-md transition-shadow col-span-2 md:col-span-1 xl:col-span-1 w-full flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 text-[#8B6E32] mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">
              Store Revenue
            </span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-[#FAF7F2] text-[#651F35] shrink-0">
              <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <div className="font-serif text-[clamp(1.2rem,3.5vw,1.5rem)] font-bold text-[#25201D] leading-tight truncate">
              {formatPrice(stats.storeRevenue)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[10px] sm:text-xs text-emerald-600 font-medium truncate">
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Paid fulfillment orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Star Section: Design Field Health Checklist (1-Click Audit Links) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 md:p-6 border border-[#E8DCC8] shadow-xs space-y-4 sm:space-y-5 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 border-b border-[#F0E6D8] pb-3.5 sm:pb-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#B88A3B] shrink-0" />
              <h3 className="font-serif text-[clamp(1.05rem,2.8vw,1.25rem)] font-bold text-[#25201D] truncate">
                Design Field Health Checklist
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-[#6B5E51] mt-0.5 leading-snug">
              Click any checklist card below to immediately filter & inspect sarees in the Design Field Checker.
            </p>
          </div>

          <Link
            href="/admin/design-checker"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#651F35] hover:text-[#4A1627] hover:underline shrink-0 min-h-[36px]"
          >
            <span>Open Quality Control</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-3.5 lg:gap-4 w-full">
          {checklistItems.map((item) => {
            const Icon = item.icon
            const hasIssue = item.count > 0

            return (
              <Link
                key={item.title}
                href={`/admin/design-checker?filter=${item.filter}`}
                onClick={() => setAuditFilter(item.filter)}
                className={`w-full flex items-start gap-3 p-3 sm:p-3.5 rounded-xl border transition-all duration-200 group min-h-[44px] ${
                  hasIssue
                    ? "bg-[#FAF7F2] hover:bg-white hover:border-[#D4AF37] hover:shadow-md"
                    : "bg-white/60 opacity-80 border-gray-200 hover:opacity-100"
                }`}
              >
                <div className={`p-2 sm:p-2.5 rounded-xl border shrink-0 ${item.color}`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1.5">
                    <h4 className="text-xs sm:text-sm font-semibold text-[#25201D] group-hover:text-[#651F35] transition-colors leading-snug">
                      {item.title}
                    </h4>
                    <span
                      className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                        hasIssue
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {item.count} {item.count === 1 ? "saree" : "sarees"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7A6E62] mt-1 leading-snug line-clamp-2">
                    {item.description}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[#B88A3B] group-hover:translate-x-0.5 transition-transform">
                    <span>Audit Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Split Section: Recent Orders & Recently Added Sarees (1-col on mobile, 12-col on xl) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-8 w-full">
        {/* Left: Recent Orders (7 Cols on xl) */}
        <div className="xl:col-span-7 bg-white rounded-2xl p-4 sm:p-6 border border-[#E8DCC8] shadow-2xs space-y-4 w-full">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0E6D8]">
            <div className="min-w-0 flex-1">
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#25201D] truncate">
                Recent Customer Orders
              </h3>
              <p className="text-[11px] sm:text-xs text-[#6B5E51] truncate">
                Real-time fulfillment queue & order delivery status
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-[#651F35] hover:underline flex items-center gap-1 shrink-0 min-h-[36px]"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Mobile Order Cards View (< sm / 640px) */}
          <div className="sm:hidden space-y-2.5">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-xs text-[#651F35] truncate">
                    {order.order_number}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                      order.payment_status === "paid"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {order.payment_status}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-[#25201D] truncate">
                      {order.customer_name}
                    </div>
                    <div className="text-[11px] text-[#8C8074] truncate">
                      {order.address.city}, {order.address.state}
                    </div>
                  </div>
                  <div className="font-semibold text-[#25201D] shrink-0 text-sm">
                    {formatPrice(order.total)}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E8DCC8]/60 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-medium text-[#8C8074]">Fulfillment:</span>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateOrderStatus(order.id, e.target.value as OrderStatus)
                    }
                    className="text-[11px] font-semibold rounded-lg px-2 py-1.5 bg-white border border-[#D8CFBC] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none cursor-pointer min-h-[36px]"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop & Tablet Table View (>= sm / 640px) */}
          <div className="hidden sm:block overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[540px] text-left text-xs text-[#25201D]">
              <thead className="text-[11px] uppercase tracking-wider text-[#8B6E32] bg-[#FAF7F2] border-y border-[#E8DCC8]">
                <tr>
                  <th className="py-2.5 px-3">Order</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E6D8]">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3 px-3 font-semibold text-[#651F35]">
                      {order.order_number}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-[#25201D]">
                        {order.customer_name}
                      </div>
                      <div className="text-[11px] text-[#8C8074]">
                        {order.address.city}, {order.address.state}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-medium">
                      {formatPrice(order.total)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          order.payment_status === "paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {order.payment_method} · {order.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value as OrderStatus)
                        }
                        className="text-[11px] font-semibold rounded-lg px-2 py-1 bg-white border border-[#D8CFBC] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Recently Added Sarees (5 Cols on xl) */}
        <div className="xl:col-span-5 bg-white rounded-2xl p-4 sm:p-6 border border-[#E8DCC8] shadow-2xs space-y-4 w-full">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0E6D8]">
            <div className="min-w-0 flex-1">
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#25201D] truncate">
                Catalog Saree Quality
              </h3>
              <p className="text-[11px] sm:text-xs text-[#6B5E51] truncate">
                Completeness badges & audit triggers
              </p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-[#651F35] hover:underline flex items-center gap-1 shrink-0 min-h-[36px]"
            >
              <span>Catalog</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {recentSarees.map((saree) => {
              const score = saree.completeness.score
              const is100 = score === 100
              const primaryImg =
                saree.product_images?.find((img) => img.is_primary)?.image_url ||
                saree.product_images?.[0]?.image_url ||
                "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80"

              return (
                <div
                  key={saree.id}
                  className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 rounded-xl bg-[#FAF7F2] hover:bg-white border border-[#E8DCC8] hover:border-[#D4AF37] transition-all group w-full min-w-0"
                >
                  <div className="w-11 h-13 sm:w-12 sm:h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-[#E8DCC8] relative">
                    <img
                      src={primaryImg}
                      alt={saree.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-[#25201D] truncate">
                      {saree.name}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#7A6E62] truncate mt-0.5">
                      <span className="truncate">{saree.fabric || "No Fabric"}</span>
                      <span>·</span>
                      <span className="font-medium text-[#25201D] shrink-0">
                        ₹{saree.price?.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full ${
                        is100
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : score >= 70
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-rose-100 text-rose-800 border border-rose-300"
                      }`}
                    >
                      {score}% QC
                    </span>

                    <Link
                      href={`/admin/design-checker?id=${saree.id}`}
                      onClick={() => setSelectedAuditProductId(saree.id)}
                      className="text-[10px] font-semibold text-[#651F35] hover:text-[#8B2D47] flex items-center gap-0.5 min-h-[28px] group-hover:underline"
                    >
                      <span>Audit</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
