"use client"

import React, { useState } from "react"
import { useAdmin } from "@/contexts/AdminContext"
import { Plus, Edit, Trash2, X, Scissors } from "lucide-react"
import { FabricMaterial } from "@/types/admin"

export default function AdminFabricMaterialsPage() {
  const { fabricMaterials, products, createFabricMaterial, updateFabricMaterial, deleteFabricMaterial } = useAdmin()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingFabric, setEditingFabric] = useState<FabricMaterial | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    is_active: true,
    sort_order: 0,
  })

  // Filter and sort fabrics
  const filteredFabrics = fabricMaterials
    .filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.slug.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const success = await createFabricMaterial({
      ...form,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    })
    if (success) {
      setForm({ name: "", slug: "", description: "", is_active: true, sort_order: 0 })
      setIsAddOpen(false)
    }
  }

  const getProductCount = (fabricId: string) => {
    return products.filter((p) => p.fabric_material_id === fabricId).length
  }

  return (
    <div className="space-y-6">
      {/* Title & Add CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#25201D]">
            Fabric Materials
          </h2>
          <p className="text-[11px] sm:text-xs text-[#6B5E51] mt-1">
            Manage the fabric materials available for saree products.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#651F35] to-[#8B2D47] text-white text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Fabric Material</span>
        </button>
      </div>

      {/* Search & Actions */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#E8DCC8] shadow-xs flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search fabric material..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-sm focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
        />
      </div>

      {/* Table (Desktop) / Cards (Mobile) */}
      <div className="bg-white rounded-3xl border border-[#E8DCC8] shadow-xs overflow-hidden">
        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E8DCC8]">
                <th className="px-6 py-4 text-[11px] font-bold text-[#8C8074] uppercase tracking-wider">Fabric Material</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#8C8074] uppercase tracking-wider">Products</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#8C8074] uppercase tracking-wider">Sort Order</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#8C8074] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#8C8074] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DCC8]">
              {filteredFabrics.map((fabric) => (
                <tr key={fabric.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] flex items-center justify-center text-[#B88A3B]">
                        <Scissors className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-[#25201D] text-sm">{fabric.name}</div>
                        <div className="text-[11px] text-[#8C8074] font-mono mt-0.5">{fabric.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#E8DCC8] text-[11px] font-bold text-[#6B5E51]">
                      {getProductCount(fabric.id)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-[#6B5E51]">
                    {fabric.sort_order}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => updateFabricMaterial(fabric.id, { is_active: !fabric.is_active })}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                        fabric.is_active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {fabric.is_active ? "● Active" : "○ Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => setEditingFabric(fabric)}
                      className="p-1.5 rounded-lg text-[#8B6E32] hover:bg-[#FAF7F2] transition-colors"
                      title="Edit Fabric"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteFabricMaterial(fabric.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Fabric"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredFabrics.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#8C8074] text-sm">
                    No fabric materials found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="sm:hidden divide-y divide-[#E8DCC8]">
          {filteredFabrics.map((fabric) => (
            <div key={fabric.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] flex items-center justify-center text-[#B88A3B] shrink-0">
                    <Scissors className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-[#25201D] text-sm">{fabric.name}</div>
                    <div className="text-[11px] text-[#8C8074] mt-0.5">{getProductCount(fabric.id)} Products</div>
                  </div>
                </div>
                <button
                  onClick={() => updateFabricMaterial(fabric.id, { is_active: !fabric.is_active })}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    fabric.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {fabric.is_active ? "● Active" : "○ Inactive"}
                </button>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-[#FAF7F2]">
                <button
                  onClick={() => setEditingFabric(fabric)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-[#E8DCC8] text-[11px] font-bold text-[#6B5E51] hover:bg-[#FAF7F2]"
                >
                  <Edit className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => {
                    const inUse = getProductCount(fabric.id) > 0;
                    if (inUse) {
                      updateFabricMaterial(fabric.id, { is_active: false })
                    } else {
                      deleteFabricMaterial(fabric.id)
                    }
                  }}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border text-[11px] font-bold ${
                    getProductCount(fabric.id) > 0
                      ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                      : "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                  }`}
                >
                  {getProductCount(fabric.id) > 0 ? (
                    <>Deactivate Instead</>
                  ) : (
                    <><Trash2 className="w-3 h-3" /> Delete</>
                  )}
                </button>
              </div>
            </div>
          ))}
          {filteredFabrics.length === 0 && (
            <div className="p-8 text-center text-[#8C8074] text-sm">
              No fabric materials found.
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#D4AF37]/30 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-5 bg-[#181214] text-white flex items-center justify-between border-b border-[#302127]">
              <h3 className="font-serif text-base font-bold">Add Fabric Material</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-[#D8CFBC] hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-4 sm:p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#25201D] uppercase">Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kanjivaram Silk"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#25201D] uppercase">Slug (Optional)</label>
                <input
                  type="text"
                  placeholder="Auto-generated if left blank"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#25201D] uppercase">Sort Order</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#25201D] uppercase">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D]"
                />
              </div>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E8DCC8] bg-[#FAF7F2] cursor-pointer hover:bg-[#F5EDD9]">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-[#651F35] focus:ring-[#651F35]"
                />
                <span className="font-bold text-[#25201D]">Active</span>
              </label>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 rounded-xl bg-[#FAF7F2] font-semibold text-[#6B5E51]">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#651F35] to-[#8B2D47] text-white font-bold">
                  Save Fabric Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingFabric && (
        <EditFabricModal
          fabric={editingFabric}
          onClose={() => setEditingFabric(null)}
          onSave={async (updates) => {
            await updateFabricMaterial(editingFabric.id, updates)
            setEditingFabric(null)
          }}
        />
      )}
    </div>
  )
}

function EditFabricModal({
  fabric,
  onClose,
  onSave,
}: {
  fabric: FabricMaterial
  onClose: () => void
  onSave: (updates: Partial<FabricMaterial>) => Promise<void>
}) {
  const [form, setForm] = useState({
    name: fabric.name || "",
    slug: fabric.slug || "",
    description: fabric.description || "",
    sort_order: fabric.sort_order ?? 0,
    is_active: fabric.is_active ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    await onSave({
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border border-[#D4AF37]/30 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-5 bg-[#181214] text-white flex items-center justify-between border-b border-[#302127]">
          <h3 className="font-serif text-base font-bold">Edit Fabric Material</h3>
          <button onClick={onClose} className="text-[#D8CFBC] hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-[#25201D] uppercase">Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#25201D] uppercase">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#25201D] uppercase">Sort Order</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#25201D] uppercase">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D]"
            />
          </div>

          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E8DCC8] bg-[#FAF7F2] cursor-pointer hover:bg-[#F5EDD9]">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-[#651F35] focus:ring-[#651F35]"
            />
            <span className="font-bold text-[#25201D]">Active</span>
          </label>

          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-[#FAF7F2] font-semibold text-[#6B5E51]">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-[#181214] text-white font-bold">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
