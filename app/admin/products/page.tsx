"use client"

import React, { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useAdmin } from "@/contexts/AdminContext"
import {
  Layers,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Camera,
  Tag,
  Palette,
  IndianRupee,
} from "lucide-react"
import {
  SAREE_OCCASIONS,
  SAREE_COLOR_PALETTES,
  ProductWithDetails,
  FabricMaterial,
} from "@/types/admin"
import { AdminImageUpload } from "@/components/admin/AdminImageUpload"

function AdminProductsContent() {
  const searchParams = useSearchParams()
  const actionParam = searchParams.get("action")

  const {
    products,
    categories,
    collections,
    fabricMaterials,
    createProduct,
    updateProduct,
    deleteProduct,
    setSelectedAuditProductId,
  } = useAdmin()

  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedFabric, setSelectedFabric] = useState("all")
  const [selectedOccasion, setSelectedOccasion] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductWithDetails | null>(null)

  // Open modal if URL has ?action=new
  useEffect(() => {
    if (actionParam === "new") {
      setIsAddModalOpen(true)
    }
  }, [actionParam])

  // New Saree Form State
  const [newSaree, setNewSaree] = useState({
    name: "",
    slug: "",
    sku: "",
    category_id: "",
    collection_id: "",
    fabric_material_id: "",
    fabric: "",
    color: "",
    occasion: "",
    price: 0,
    mrp: 0,
    stock: 0,
    is_new: false,
    is_bestseller: false,
    is_featured: false,
    is_active: true,
    description: "",
    image_url: "",
  })

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchName = p.name?.toLowerCase().includes(q)
        const matchSku = p.sku?.toLowerCase().includes(q)
        if (!matchName && !matchSku) return false
      }
      if (selectedCategory !== "all" && p.category_id !== selectedCategory)
        return false
      if (selectedFabric !== "all" && p.fabric_material_id !== selectedFabric) return false
      if (selectedOccasion !== "all" && p.occasion !== selectedOccasion)
        return false
      return true
    })
  }, [products, search, selectedCategory, selectedFabric, selectedOccasion])

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSaree.name.trim()) return

    const initialImages = newSaree.image_url
      ? [{ url: newSaree.image_url.trim(), sort_order: 0, is_primary: true }]
      : []

    await createProduct(newSaree, initialImages)
    setIsAddModalOpen(false)
    setNewSaree({
      name: "",
      slug: "",
      sku: "",
      category_id: "",
      collection_id: "",
      fabric_material_id: "",
      fabric: "",
      color: "Royal Magenta",
      occasion: "Wedding",
      price: 8999,
      mrp: 12999,
      stock: 20,
      is_new: true,
      is_bestseller: false,
      is_featured: false,
      is_active: true,
      description: "",
      image_url: "",
    })
  }

  const handleToggleActive = async (product: ProductWithDetails) => {
    await updateProduct(product.id, {
      is_active: !product.is_active,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#25201D]">
            Saree Catalog & Inventory
          </h2>
          <p className="text-[11px] sm:text-xs text-[#6B5E51] mt-1">
            Manage product listings, SKU stock levels, visibility switches, and direct QC audit triggers.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#651F35] to-[#8B2D47] hover:from-[#501829] hover:to-[#722338] text-white text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer w-full sm:w-auto min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Saree</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#E8DCC8] shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C8074] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by saree title, SKU (e.g. TS-KANJ-001)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 sm:py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] placeholder-[#A89F91] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] min-h-[42px]"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none cursor-pointer min-h-[42px]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Fabric Filter */}
          <select
            value={selectedFabric}
            onChange={(e) => setSelectedFabric(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none cursor-pointer min-h-[42px]"
          >
            <option value="all">All Fabrics</option>
            {fabricMaterials.filter(f => f.is_active).map((f) => (
              <option key={f.id} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>

          {/* Occasion Filter */}
          <select
            value={selectedOccasion}
            onChange={(e) => setSelectedOccasion(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none cursor-pointer min-h-[42px]"
          >
            <option value="all">All Occasions</option>
            {SAREE_OCCASIONS.map((occ) => (
              <option key={occ} value={occ}>
                {occ}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Catalog Table - Desktop & Laptop */}
      <div className="hidden md:block bg-white rounded-2xl border border-[#E8DCC8] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[880px] text-left text-xs text-[#25201D]">
            <thead className="text-[11px] uppercase tracking-wider text-[#8B6E32] bg-[#FAF7F2] border-b border-[#E8DCC8]">
              <tr>
                <th className="py-3 px-4">Saree & Visual</th>
                <th className="py-3 px-3">Design Attributes</th>
                <th className="py-3 px-3">Pricing & MRP</th>
                <th className="py-3 px-3">Stock Units</th>
                <th className="py-3 px-3">QC Health</th>
                <th className="py-3 px-3">Live Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E6D8]">
              {filteredProducts.map((p) => {
                const primaryImg =
                  p.product_images?.find((img) => img.is_primary)?.image_url ||
                  p.product_images?.[0]?.image_url ||
                  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&q=80"
                const score = p.completeness?.score || 0
                const is100 = score === 100

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-[#FAF7F2]/60 transition-colors group"
                  >
                    {/* Saree & Visual */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-[#E8DCC8] relative shadow-xs">
                          <img
                            src={primaryImg}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] text-center font-bold py-0.5">
                            {p.product_images?.length || 0} pics
                          </span>
                        </div>
                        <div className="min-w-0 max-w-[200px]">
                          <div className="font-serif font-bold text-xs text-[#25201D] truncate group-hover:text-[#651F35] transition-colors">
                            {p.name}
                          </div>
                          <div className="text-[10px] font-mono text-[#8C8074] mt-0.5">
                            {p.sku || "NO SKU"}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {p.is_bestseller && (
                              <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                BESTSELLER
                              </span>
                            )}
                            {p.is_new && (
                              <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-[#651F35]/15 text-[#651F35] border border-[#651F35]/30">
                                NEW
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Design Attributes */}
                    <td className="py-3.5 px-3">
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-[#25201D]">
                          {p.fabric || (
                            <span className="text-amber-600">No Fabric</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#6B5E51]">
                          <span>{p.color || "No Color"}</span>
                          <span>·</span>
                          <span>{p.occasion || "No Occasion"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Pricing */}
                    <td className="py-3.5 px-3">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-xs text-[#651F35]">
                          ₹{p.price?.toLocaleString("en-IN")}
                        </div>
                        {p.mrp && p.mrp > p.price && (
                          <div className="text-[10px] text-[#8C8074]">
                            <span className="line-through">
                              ₹{p.mrp?.toLocaleString("en-IN")}
                            </span>{" "}
                            <span className="text-emerald-700 font-semibold">
                              ({Math.round(((p.mrp - p.price) / p.mrp) * 100)}% off)
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Stock Units */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-semibold text-xs ${
                            p.stock < 10 ? "text-amber-700" : "text-[#25201D]"
                          }`}
                        >
                          {p.stock} units
                        </span>
                        {p.stock < 10 && (
                          <span
                            className="w-2 h-2 rounded-full bg-amber-500 shrink-0"
                            title="Low Stock"
                          />
                        )}
                      </div>
                    </td>

                    {/* QC Completeness */}
                    <td className="py-3.5 px-3">
                      <Link
                        href={`/admin/design-checker?id=${p.id}`}
                        onClick={() => setSelectedAuditProductId(p.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all hover:scale-105"
                      >
                        <span
                          className={`px-2 py-0.5 rounded-full ${
                            is100
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : score >= 70
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-rose-100 text-rose-800 border border-rose-300"
                          }`}
                        >
                          {score}% QC
                        </span>
                      </Link>
                    </td>

                    {/* Live Status Toggle */}
                    <td className="py-3.5 px-3">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(p)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                          p.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            p.is_active ? "bg-emerald-500" : "bg-gray-400"
                          }`}
                        />
                        <span>{p.is_active ? "Published" : "Draft"}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(p)}
                          className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                          title="Edit Saree Details & Images"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <Link
                          href={`/admin/design-checker?id=${p.id}`}
                          onClick={() => setSelectedAuditProductId(p.id)}
                          className="p-1.5 rounded-lg text-[#651F35] hover:bg-[#651F35]/10 transition-colors"
                          title="Audit in Design Checker"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => deleteProduct(p.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Saree"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Catalog Card View (md:hidden) */}
      <div className="md:hidden space-y-3">
        {filteredProducts.map((p) => {
          const primaryImg =
            p.product_images?.find((img) => img.is_primary)?.image_url ||
            p.product_images?.[0]?.image_url ||
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&q=80"
          const score = p.completeness?.score || 0
          const is100 = score === 100

          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-[#E8DCC8] p-3.5 shadow-2xs space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-16 h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-[#E8DCC8] relative shadow-2xs">
                  <img
                    src={primaryImg}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-black/65 text-white text-[8px] text-center font-bold py-0.5">
                    {p.product_images?.length || 0} pics
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1.5">
                    <h4 className="font-serif font-bold text-xs text-[#25201D] truncate">
                      {p.name}
                    </h4>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                        is100
                          ? "bg-emerald-100 text-emerald-800"
                          : score >= 70
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {score}% QC
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-[#8C8074] mt-0.5">
                    {p.sku || "NO SKU"}
                  </div>

                  <div className="text-[11px] text-[#6B5E51] mt-1">
                    <span>{p.fabric || "No Fabric"}</span> · <span>{p.color || "No Color"}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-serif font-bold text-xs text-[#651F35]">
                      ₹{p.price?.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-[#8C8074] line-through">
                      ₹{p.mrp?.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-[#6B5E51] font-semibold">
                      Stock: {p.stock}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-[#F0E6D8]">
                <button
                  type="button"
                  onClick={() => handleToggleActive(p)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer transition-colors min-h-[36px] inline-flex items-center ${
                    p.is_active
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                      : "bg-gray-100 text-gray-600 border border-gray-300"
                  }`}
                >
                  {p.is_active ? "● Active in Store" : "Hidden"}
                </button>

                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/admin/design-checker?id=${p.id}`}
                    onClick={() => setSelectedAuditProductId(p.id)}
                    className="px-2.5 py-1.5 rounded-xl text-[10px] font-semibold bg-[#651F35]/10 text-[#651F35] hover:bg-[#651F35]/15 inline-flex items-center gap-1 min-h-[36px]"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Audit</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setEditingProduct(p)}
                    className="w-9 h-9 rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 cursor-pointer flex items-center justify-center"
                    title="Edit Saree"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteProduct(p.id)}
                    className="w-9 h-9 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 cursor-pointer flex items-center justify-center"
                    title="Delete Saree"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add New Saree Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#D4AF37]/40 shadow-2xl overflow-hidden max-h-[90vh] sm:max-h-[88vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-[#181214] to-[#381622] text-white flex items-center justify-between border-b border-[#D4AF37]/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#D4AF37] text-[#181214]">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold">
                    Add New Haute Couture Saree
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#D8CFBC]">
                    Create a new saree listing with full design attributes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#D8CFBC] hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleCreateSubmit}
              className="p-4 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 custom-scrollbar flex-1 text-xs"
            >
              {/* Name & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#25201D] uppercase tracking-wider">
                    Saree Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Kanjivaram Pure Silk Saree"
                    value={newSaree.name}
                    onChange={(e) =>
                      setNewSaree({ ...newSaree, name: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#25201D] uppercase tracking-wider">
                    SKU Identifier
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TS-KANJ-002"
                    value={newSaree.sku}
                    onChange={(e) =>
                      setNewSaree({ ...newSaree, sku: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              {/* Fabric, Color, Occasion */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#25201D] uppercase tracking-wider">
                    Fabric
                  </label>
                  <select
                    value={newSaree.fabric_material_id}
                    onChange={(e) => {
                      const selectedFabric = fabricMaterials.find(f => f.id === e.target.value)
                      setNewSaree({ 
                        ...newSaree, 
                        fabric_material_id: e.target.value,
                        fabric: selectedFabric ? selectedFabric.name : "" 
                      })
                    }}
                    className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                  >
                    <option value="">-- No Fabric --</option>
                    {fabricMaterials.filter(f => f.is_active).map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#25201D] uppercase tracking-wider">
                    Color Shade
                  </label>
                  <select
                    value={newSaree.color}
                    onChange={(e) =>
                      setNewSaree({ ...newSaree, color: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                  >
                    {SAREE_COLOR_PALETTES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#25201D] uppercase tracking-wider">
                    Occasion
                  </label>
                  <select
                    value={newSaree.occasion}
                    onChange={(e) =>
                      setNewSaree({ ...newSaree, occasion: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                  >
                    {SAREE_OCCASIONS.map((occ) => (
                      <option key={occ} value={occ}>
                        {occ}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price, MRP, Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#25201D] uppercase tracking-wider">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newSaree.price}
                    onChange={(e) =>
                      setNewSaree({ ...newSaree, price: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#25201D] uppercase tracking-wider">
                    MRP (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newSaree.mrp}
                    onChange={(e) =>
                      setNewSaree({ ...newSaree, mrp: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#25201D] uppercase tracking-wider">
                    Stock Units
                  </label>
                  <input
                    type="number"
                    value={newSaree.stock}
                    onChange={(e) =>
                      setNewSaree({ ...newSaree, stock: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none font-bold"
                  />
                </div>
              </div>

              {/* Primary Saree Drape Image Upload */}
              <div className="space-y-1">
                <AdminImageUpload
                  value={newSaree.image_url}
                  onChange={(url) => setNewSaree({ ...newSaree, image_url: url })}
                  bucket="product-images"
                  label="Primary Saree Drape Image (Upload File)"
                  aspectRatio="3/4"
                  prefix="saree-primary"
                  placeholderText="Drop primary saree drape photo here, or browse files"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[#F0E6D8] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#FAF7F2] text-[#6B5E51] font-semibold hover:bg-[#F5EDD9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#651F35] to-[#8B2D47] text-white font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  Add to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Saree Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          categories={categories}
          collections={collections}
          fabricMaterials={fabricMaterials}
          onClose={() => setEditingProduct(null)}
          onSave={async (updates) => {
            await updateProduct(editingProduct.id, updates)
            setEditingProduct(null)
          }}
        />
      )}
    </div>
  )
}

function EditProductModal({
  product,
  categories,
  collections,
  fabricMaterials,
  onClose,
  onSave,
}: {
  product: ProductWithDetails
  categories: any[]
  collections: any[]
  fabricMaterials: FabricMaterial[]
  onClose: () => void
  onSave: (updates: any) => Promise<void>
}) {
  const { setProductPrimaryImage, removeProductImage, addProductImage } = useAdmin()
  const [isSaving, setIsSaving] = useState(false)
  const [newUploadedUrl, setNewUploadedUrl] = useState("")

  const [form, setForm] = useState({
    name: product.name || "",
    slug: product.slug || "",
    sku: product.sku || "",
    category_id: product.category_id || "",
    collection_id: product.collection_id || "",
    fabric_material_id: product.fabric_material_id || "",
    fabric: product.fabric || "",
    color: product.color || "Royal Magenta",
    occasion: product.occasion || "Wedding",
    price: product.price || 0,
    mrp: product.mrp || 0,
    stock: product.stock ?? 10,
    is_new: product.is_new ?? false,
    is_bestseller: product.is_bestseller ?? false,
    is_featured: product.is_featured ?? false,
    is_active: product.is_active ?? true,
    short_description: product.short_description || "",
    description: product.description || "",
  })

  const discountPercent =
    form.mrp > 0 && form.price <= form.mrp
      ? Math.round(((form.mrp - form.price) / form.mrp) * 100)
      : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await onSave({
        ...form,
        category_id: form.category_id || null,
        collection_id: form.collection_id || null,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddNewImage = async (url: string) => {
    if (!url) return
    await addProductImage(product.id, url)
    setNewUploadedUrl("")
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#D4AF37]/40 shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[88vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#181214] via-[#2A151E] to-[#651F35] text-white flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-[#D4AF37] text-[#181214] shrink-0">
              <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#FFF9EF] truncate">
                  Edit Saree Product
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/15 text-[#D4AF37] shrink-0">
                  {form.sku || "NO SKU"}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#D8CFBC] mt-0.5 truncate max-w-[280px] sm:max-w-md">
                Update saree specifications, pricing, inventory stock, and high-res image angles.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#D8CFBC] hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 custom-scrollbar flex-1 text-xs"
        >
          {/* Saree Title & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[#25201D] uppercase tracking-wider text-[11px]">
                Saree Title *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#25201D] uppercase tracking-wider text-[11px]">
                URL Slug
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none font-mono text-[11px]"
              />
            </div>
          </div>

          {/* SKU, Category, Collection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[#25201D] uppercase tracking-wider text-[11px]">
                SKU Code
              </label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#25201D] uppercase tracking-wider text-[11px]">
                Category
              </label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
              >
                <option value="">-- No Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#25201D] uppercase tracking-wider text-[11px]">
                Collection / Edit
              </label>
              <select
                value={form.collection_id}
                onChange={(e) => setForm({ ...form, collection_id: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
              >
                <option value="">-- No Collection --</option>
                {collections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fabric, Color, Occasion */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[#25201D] uppercase tracking-wider text-[11px]">
                Fabric
              </label>
              <select
                value={form.fabric_material_id}
                onChange={(e) => {
                  const selectedFabric = fabricMaterials.find(f => f.id === e.target.value)
                  setForm({ 
                    ...form, 
                    fabric_material_id: e.target.value,
                    fabric: selectedFabric ? selectedFabric.name : "" 
                  })
                }}
                className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
              >
                <option value="">-- No Fabric --</option>
                {fabricMaterials.filter(f => f.is_active).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#25201D] uppercase tracking-wider text-[11px]">
                Color Palette
              </label>
              <select
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
              >
                {SAREE_COLOR_PALETTES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#25201D] uppercase tracking-wider text-[11px]">
                Occasion
              </label>
              <select
                value={form.occasion}
                onChange={(e) => setForm({ ...form, occasion: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
              >
                {SAREE_OCCASIONS.map((occ) => (
                  <option key={occ} value={occ}>
                    {occ}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing, MRP, Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DCC8]">
            <div className="space-y-1">
              <label className="font-bold text-[#651F35] uppercase tracking-wider text-[11px] flex items-center justify-between">
                <span>Selling Price (₹) *</span>
              </label>
              <input
                type="number"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-white border border-[#E8DCC8] text-[#651F35] font-bold text-sm focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#8C8074] uppercase tracking-wider text-[11px] flex items-center justify-between">
                <span>MRP / List Price (₹) *</span>
                {discountPercent > 0 && (
                  <span className="text-emerald-700 font-bold text-[10px]">
                    {discountPercent}% OFF
                  </span>
                )}
              </label>
              <input
                type="number"
                required
                value={form.mrp}
                onChange={(e) => setForm({ ...form, mrp: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-white border border-[#E8DCC8] text-[#25201D] font-bold text-sm focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#25201D] uppercase tracking-wider text-[11px]">
                Stock Units Available
              </label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-white border border-[#E8DCC8] text-[#25201D] font-bold text-sm focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          {/* Visibility & Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <label className="flex items-center gap-2 p-3 rounded-xl border border-[#E8DCC8] bg-[#FAF7F2] cursor-pointer hover:bg-[#F5EDD9] transition-colors">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 rounded text-[#651F35] focus:ring-[#D4AF37]"
              />
              <span className="font-bold text-[#25201D]">Active / Live</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl border border-[#E8DCC8] bg-[#FAF7F2] cursor-pointer hover:bg-[#F5EDD9] transition-colors">
              <input
                type="checkbox"
                checked={form.is_new}
                onChange={(e) => setForm({ ...form, is_new: e.target.checked })}
                className="w-4 h-4 rounded text-[#651F35] focus:ring-[#D4AF37]"
              />
              <span className="font-bold text-[#25201D]">New Arrival</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl border border-[#E8DCC8] bg-[#FAF7F2] cursor-pointer hover:bg-[#F5EDD9] transition-colors">
              <input
                type="checkbox"
                checked={form.is_bestseller}
                onChange={(e) => setForm({ ...form, is_bestseller: e.target.checked })}
                className="w-4 h-4 rounded text-[#651F35] focus:ring-[#D4AF37]"
              />
              <span className="font-bold text-[#25201D]">Bestseller</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl border border-[#E8DCC8] bg-[#FAF7F2] cursor-pointer hover:bg-[#F5EDD9] transition-colors">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="w-4 h-4 rounded text-[#651F35] focus:ring-[#D4AF37]"
              />
              <span className="font-bold text-[#25201D]">Featured</span>
            </label>
          </div>

          {/* Saree Image Gallery Management */}
          <div className="space-y-3 pt-3 border-t border-[#E8DCC8]">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[#25201D] uppercase tracking-wider text-[11px] flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#651F35]" />
                <span>Saree Image Angles ({product.product_images?.length || 0})</span>
              </h4>
            </div>

            {/* Existing Images Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {product.product_images?.map((img) => (
                <div
                  key={img.id}
                  className={`relative rounded-xl overflow-hidden border aspect-[3/4] group bg-[#FAF7F2] ${
                    img.is_primary
                      ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/50 shadow-md"
                      : "border-[#E8DCC8]"
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt="Saree angle"
                    className="w-full h-full object-cover"
                  />
                  {img.is_primary && (
                    <span className="absolute top-1 left-1 bg-[#D4AF37] text-[#181214] font-bold text-[8px] px-1.5 py-0.5 rounded shadow-xs">
                      PRIMARY
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                    {!img.is_primary && (
                      <button
                        type="button"
                        onClick={() => setProductPrimaryImage(product.id, img.id)}
                        className="px-2 py-0.5 rounded bg-[#D4AF37] text-[#181214] font-bold text-[9px] hover:scale-105 transition-transform cursor-pointer"
                      >
                        Make Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeProductImage(product.id, img.id)}
                      className="p-1 rounded bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload New Image Angle */}
            <div className="mt-2">
              <AdminImageUpload
                value={newUploadedUrl}
                onChange={(url) => {
                  setNewUploadedUrl(url)
                  handleAddNewImage(url)
                }}
                bucket="product-images"
                label="Add New Saree Angle / Drape Photo"
                aspectRatio="3/4"
                prefix="saree-angle"
                placeholderText="Upload an extra photo angle to add to this saree's gallery"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-3 pt-3 border-t border-[#E8DCC8]">
            <div className="space-y-1">
              <label className="font-bold text-[#25201D] uppercase tracking-wider text-[11px]">
                Short Summary
              </label>
              <input
                type="text"
                placeholder="e.g. Pure handwoven Kanjivaram silk saree with zari border"
                value={form.short_description}
                onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#25201D] uppercase tracking-wider text-[11px]">
                Full Craft & Weave Story
              </label>
              <textarea
                rows={3}
                placeholder="Detailed craft narrative, weaving technique, blouse piece details, care instructions..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-[#F0E6D8] flex items-center justify-end gap-3 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#FAF7F2] text-[#6B5E51] font-semibold hover:bg-[#F5EDD9] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#651F35] to-[#8B2D47] text-white font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? "Saving to Database..." : "Save Saree Updates"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminProductsPage() {
  return (
    <React.Suspense fallback={<div className="p-8 flex items-center justify-center text-sm text-[#6B5E51]">Loading Saree Inventory...</div>}>
      <AdminProductsContent />
    </React.Suspense>
  )
}
