"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAdmin } from "@/contexts/AdminContext"
import {
  Menu,
  ExternalLink,
  ShieldCheck,
  Plus,
} from "lucide-react"

interface AdminHeaderProps {
  setMobileOpen: (open: boolean) => void
  onOpenAddModal?: () => void
}

export function AdminHeader({ setMobileOpen }: AdminHeaderProps) {
  const pathname = usePathname()
  const { stats } = useAdmin()

  let pageTitle = "Executive Dashboard"
  let breadcrumb = "Overview"

  if (pathname === "/admin/design-checker") {
    pageTitle = "Design Field Checker"
    breadcrumb = "Quality Control"
  } else if (pathname === "/admin/products") {
    pageTitle = "Saree Catalog"
    breadcrumb = "Inventory"
  } else if (pathname === "/admin/orders") {
    pageTitle = "Order Fulfillment"
    breadcrumb = "Orders"
  } else if (pathname === "/admin/coupons") {
    pageTitle = "Coupons & Discounts"
    breadcrumb = "Promotions"
  } else if (pathname === "/admin/categories") {
    pageTitle = "Categories & Edits"
    breadcrumb = "Merchandising"
  } else if (pathname === "/admin/banners") {
    pageTitle = "Hero Banners"
    breadcrumb = "Marketing"
  }

  const healthScore = stats.designHealthScore
  const isHealthy = healthScore >= 85

  return (
    <header className="sticky top-0 z-20 w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DCC8] shadow-2xs transition-all pt-[env(safe-area-inset-top)]">
      <div className="w-full max-w-[1440px] mx-auto px-[clamp(16px,4vw,40px)] min-h-[58px] sm:min-h-[64px] flex items-center justify-between gap-2.5 sm:gap-4 py-2 sm:py-2.5">
        {/* Left: Mobile Toggle & Page Titles */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-white border border-[#E8DCC8] text-[#25201D] hover:bg-[#F5EDD9] active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-2xs"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5 text-[#25201D]" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-[#8B6E32] uppercase tracking-wider truncate leading-tight">
              <span className="hidden sm:inline">Trendy Sisters Admin</span>
              <span className="hidden sm:inline">/</span>
              <span className="truncate">{breadcrumb}</span>
            </div>
            <h1 className="font-serif text-[clamp(1.05rem,3.2vw,1.35rem)] font-bold text-[#25201D] tracking-tight truncate leading-tight mt-0.5">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* Right: Health Badge & Fast Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Design Health Indicator Pill */}
          <Link
            href="/admin/design-checker"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white border border-[#E8DCC8] shadow-2xs hover:border-[#D4AF37] transition-all group shrink-0 min-h-[38px]"
            title="Click to open Design Field Checker"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isHealthy ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-pulse"
              }`}
            />
            <ShieldCheck className="w-3.5 h-3.5 text-[#B88A3B] group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline text-xs font-semibold text-[#25201D]">
              QC:
            </span>
            <span
              className={`text-xs font-bold ${
                isHealthy ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              {healthScore}%
            </span>
          </Link>

          {/* View Storefront Quick Link */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#651F35] bg-[#651F35]/10 hover:bg-[#651F35]/15 border border-[#651F35]/20 transition-colors shrink-0 min-h-[38px]"
          >
            <span>Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Add Saree Quick Action */}
          <Link
            href="/admin/products?action=new"
            className="min-h-[44px] px-3 sm:px-3.5 inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#651F35] to-[#8B2D47] hover:from-[#52182A] hover:to-[#742339] shadow-xs hover:shadow-md transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Add Saree</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
