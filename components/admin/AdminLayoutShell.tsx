"use client"

import React, { useState } from "react"
import { AdminSidebar } from "./AdminSidebar"
import { AdminHeader } from "./AdminHeader"
import { AdminToasts } from "./AdminToasts"

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen w-full max-w-full bg-[#FAF7F2] text-[#25201D] flex flex-col md:flex-row antialiased selection:bg-[#651F35]/15 selection:text-[#651F35] overflow-x-hidden">
      {/* Persistent Collapsible Sidebar */}
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden">
        <AdminHeader setMobileOpen={setMobileOpen} />
        <main className="admin-main flex-1 w-full max-w-[1440px] mx-auto px-[clamp(16px,4vw,40px)] py-4 sm:py-6 lg:py-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          {children}
        </main>
      </div>

      {/* Luxury Toast Notification Stack */}
      <AdminToasts />
    </div>
  )
}
