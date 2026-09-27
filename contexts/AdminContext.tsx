"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Product,
  ProductImage,
  Category,
  Collection,
  Banner,
  OrderStatus,
  ProductWithDetails,
  AdminOrder,
  AdminCoupon,
  FilterPill,
  ToastMessage,
} from "@/types/admin"
import { calculateDesignCompleteness } from "@/lib/admin/completeness"
import { INITIAL_SAMPLE_ORDERS } from "@/lib/admin/sampleData"

interface AdminStats {
  totalSarees: number
  activeCatalog: number
  activePercentage: number
  designHealthScore: number
  totalOrders: number
  storeRevenue: number
  pendingOrdersCount: number
  checklist: {
    missingFabric: number
    missingColor: number
    missingOccasion: number
    missingImages: number
    invalidPricing: number
    lowStock: number
    needsReview: number
    complete: number
  }
}

interface AdminContextType {
  products: ProductWithDetails[]
  categories: Category[]
  collections: Collection[]
  banners: Banner[]
  orders: AdminOrder[]
  loading: boolean
  isSupabaseLive: boolean
  selectedAuditProductId: string | null
  auditFilter: FilterPill
  toasts: ToastMessage[]
  stats: AdminStats

  // Actions
  setSelectedAuditProductId: (id: string | null) => void
  setAuditFilter: (filter: FilterPill) => void
  showToast: (title: string, message: string, type?: ToastMessage["type"]) => void
  removeToast: (id: string) => void
  refreshData: () => Promise<void>

  // Product Actions (Direct Server Sync)
  updateProduct: (id: string, updates: Partial<Product>) => Promise<boolean>
  createProduct: (
    product: Partial<Product>,
    initialImageUrls?: { url: string; sort_order?: number; is_primary?: boolean }[]
  ) => Promise<ProductWithDetails | null>
  deleteProduct: (id: string) => Promise<boolean>

  // Image Actions (Direct PostgreSQL Sync)
  setProductPrimaryImage: (productId: string, imageId: string) => Promise<void>
  addProductImage: (productId: string, imageUrl: string, angleOrder?: number) => Promise<void>
  removeProductImage: (productId: string, imageId: string) => Promise<void>
  reorderProductImages: (productId: string, newImages: ProductImage[]) => Promise<void>

  // Order Actions
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    paymentStatus?: AdminOrder["payment_status"]
  ) => void
  acceptOrder: (orderId: string) => Promise<void>
  rejectOrder: (orderId: string) => Promise<void>
  updateOrderDetails: (orderId: string, payload: Partial<AdminOrder>) => Promise<boolean>
  refreshOrders: () => Promise<void>

  // Category & Collection Actions
  updateCategory: (id: string, updates: Partial<Category>) => void
  createCategory: (data: Partial<Category>) => void
  deleteCategory: (id: string) => void
  updateCollection: (id: string, updates: Partial<Collection>) => void
  createCollection: (data: Partial<Collection>) => void
  deleteCollection: (id: string) => void

  // Banner Actions
  updateBanner: (id: string, updates: Partial<Banner>) => void
  createBanner: (data: Partial<Banner>) => void
  deleteBanner: (id: string) => void

  // Coupon Actions
  coupons: AdminCoupon[]
  createCoupon: (coupon: Partial<AdminCoupon>) => Promise<AdminCoupon | null>
  updateCoupon: (id: string, updates: Partial<AdminCoupon>) => Promise<boolean>
  deleteCoupon: (id: string) => Promise<boolean>
  toggleCouponStatus: (id: string) => Promise<boolean>

  // Manual Customer Booking
  createManualOrder: (orderData: any) => Promise<boolean>
}

const AdminContext = createContext<AdminContextType | null>(null)

const STORAGE_KEYS = {
  ORDERS: "trendy_sisters_admin_orders_v1",
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<ProductWithDetails[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_SAMPLE_ORDERS)
  const [coupons, setCoupons] = useState<AdminCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [isSupabaseLive, setIsSupabaseLive] = useState(false)
  const [selectedAuditProductId, setSelectedAuditProductId] = useState<string | null>(null)
  const [auditFilter, setAuditFilter] = useState<FilterPill>("all")
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback(
    (title: string, message: string, type: ToastMessage["type"] = "success") => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: ToastMessage = { id, title, message, type }
      setToasts((prev) => [...prev, newToast])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 4500)
    },
    []
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Load Initial Data from Server API / Supabase (Single Source of Truth)
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // 1. Fetch Categories
      const { data: dbCategories } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true })

      // 2. Fetch Collections
      const { data: dbCollections } = await supabase
        .from("collections")
        .select("*")
        .order("display_order", { ascending: true })

      // 3. Fetch Banners
      const { data: dbBanners } = await supabase
        .from("banners")
        .select("*")
        .order("display_order", { ascending: true })

      // 4. Fetch Products directly via server API or Supabase client
      const res = await fetch("/api/admin/products", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      })
      const apiResult = await res.json()

      let dbProducts: any[] = []
      if (apiResult.success && Array.isArray(apiResult.products)) {
        dbProducts = apiResult.products
      } else {
        const { data: directProducts } = await supabase
          .from("products")
          .select("*, product_images(*)")
          .order("created_at", { ascending: false })
        dbProducts = directProducts || []
      }

      if (dbProducts && dbProducts.length > 0) {
        setIsSupabaseLive(true)
        const categoryMap = new Map((dbCategories || []).map((c) => [c.id, c]))
        const collectionMap = new Map((dbCollections || []).map((c) => [c.id, c]))

        const enrichedProducts: ProductWithDetails[] = dbProducts.map((p: any) => {
          const images: ProductImage[] = (p.product_images || []).sort(
            (a: ProductImage, b: ProductImage) => a.sort_order - b.sort_order
          )
          const completeness = calculateDesignCompleteness(p, images)
          return {
            ...p,
            product_images: images,
            category: p.category_id ? categoryMap.get(p.category_id) : null,
            collection: p.collection_id ? collectionMap.get(p.collection_id) : null,
            completeness,
          }
        })

        setProducts(enrichedProducts)
        if (enrichedProducts.length > 0) {
          setSelectedAuditProductId((prev) =>
            prev && enrichedProducts.some((p) => p.id === prev) ? prev : enrichedProducts[0].id
          )
        }

        if (dbCategories) setCategories(dbCategories)
        if (dbCollections) setCollections(dbCollections)
        if (dbBanners) setBanners(dbBanners)
      }

      // 5. Fetch Orders from /api/admin/orders (Live Customer Orders)
      try {
        const ordersRes = await fetch("/api/admin/orders", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        })
        const ordersData = await ordersRes.json()
        if (ordersData.success && Array.isArray(ordersData.orders) && ordersData.orders.length > 0) {
          setOrders(ordersData.orders)
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(ordersData.orders))
            } catch (e) {}
          }
        } else if (typeof window !== "undefined") {
          const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS)
          if (savedOrders) {
            try {
              const parsed = JSON.parse(savedOrders)
              if (Array.isArray(parsed) && parsed.length > 0) {
                setOrders(parsed)
              }
            } catch (e) {}
          }
        }
      } catch (ordErr) {
        console.warn("[AdminContext] Error fetching orders:", ordErr)
      }

      // 6. Fetch Coupons from /api/admin/coupons
      try {
        const coupRes = await fetch("/api/admin/coupons", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        })
        const coupData = await coupRes.json()
        if (coupData.success && Array.isArray(coupData.coupons)) {
          setCoupons(coupData.coupons)
        }
      } catch (coupErr) {
        console.warn("[AdminContext] Error fetching coupons:", coupErr)
      }
    } catch (err) {
      console.error("[AdminContext] Error loading admin data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()

    // Realtime subscription: live updates when customer places an order
    const supabase = createClient()
    const channel = supabase
      .channel("admin-orders-realtime-listener")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          console.log("[AdminContext] Realtime customer order event:", payload)
          fetch("/api/admin/orders", { cache: "no-store" })
            .then((res) => res.json())
            .then((data) => {
              if (data.success && Array.isArray(data.orders)) {
                setOrders(data.orders)
              }
            })
            .catch((e) => console.warn(e))

          if (payload.eventType === "INSERT") {
            showToast("New Order Received!", "A customer just placed a new order on the website.", "success")
          }
        }
      )
      .subscribe()

    // 10-second background heartbeat polling for 100% reliable order arrival
    const pollTimer = setInterval(() => {
      fetch("/api/admin/orders", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.orders)) {
            setOrders((prev) => {
              const prevIds = new Set(prev.map((o) => o.id))
              const hasNew = data.orders.some((o: AdminOrder) => !prevIds.has(o.id))
              if (hasNew) {
                showToast("New Order Received!", "A new order was just placed on the customer website.", "success")
              }
              return data.orders
            })
          }
        })
        .catch(() => {})
    }, 10000)

    return () => {
      clearInterval(pollTimer)
      supabase.removeChannel(channel)
    }
  }, [loadData, showToast])

  const persistOrders = useCallback((updated: AdminOrder[]) => {
    setOrders(updated)
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated))
      } catch (e) {
        console.warn("Could not save orders to localStorage:", e)
      }
    }
  }, [])

  // =========================================================================
  // PRODUCT MUTATIONS: Real Server Sync → Supabase PostgreSQL → Revalidation
  // =========================================================================

  // Update Product Attributes (Fabric, Color, Occasion, Price, MRP, Stock, etc.)
  const updateProduct = useCallback(
    async (id: string, updates: Partial<Product>): Promise<boolean> => {
      const current = products.find((p) => p.id === id)
      const currentImages = current?.product_images || []

      // Auto calculate discount if price and mrp are provided
      const price = Number(updates.price ?? current?.price ?? 0)
      const mrp = Number(updates.mrp ?? current?.mrp ?? 0)
      let discount = current?.discount ?? 0
      if (mrp > 0 && price > 0 && price <= mrp) {
        discount = Math.round(((mrp - price) / mrp) * 100)
      }

      const payloadUpdates = {
        ...updates,
        discount,
      }

      try {
        console.log(`[AdminContext] Syncing product ${id} with server API...`)
        const res = await fetch("/api/admin/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            updates: payloadUpdates,
            product_images: currentImages,
          }),
        })

        const result = await res.json()

        if (!result.success) {
          console.error("[AdminContext] Database update error:", result.error)
          showToast(
            "Sync Warning",
            result.error || "Failed to update Supabase database.",
            "error"
          )
          return false
        }

        // Successfully updated in PostgreSQL! Now update state with database record
        const dbProduct = result.product || { ...current, ...payloadUpdates }
        setProducts((prev) => {
          return prev.map((p) => {
            if (p.id !== id) return p
            const merged = { ...p, ...dbProduct }
            const completeness = calculateDesignCompleteness(
              merged,
              merged.product_images || currentImages
            )
            return {
              ...merged,
              product_images: merged.product_images || currentImages,
              completeness,
            } as ProductWithDetails
          })
        })

        showToast(
          "Synchronized to Database",
          `Price: ₹${price.toLocaleString("en-IN")} (${discount}% off) · Customer storefront updated.`,
          "success"
        )
        return true
      } catch (err: any) {
        console.error("[AdminContext] Network/API exception:", err)
        showToast("Network Error", err.message || "Failed to contact update API.", "error")
        return false
      }
    },
    [products, showToast]
  )

  // Create New Saree
  const createProduct = useCallback(
    async (
      productData: Partial<Product>,
      initialImageUrls?: { url: string; sort_order?: number; is_primary?: boolean }[]
    ): Promise<ProductWithDetails | null> => {
      try {
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product: productData,
            initialImageUrls,
          }),
        })

        const result = await res.json()

        if (!result.success || !result.product) {
          showToast("Creation Error", result.error || "Failed to create product in database", "error")
          return null
        }

        const created = result.product
        const images: ProductImage[] = (created.product_images || []).sort(
          (a: ProductImage, b: ProductImage) => a.sort_order - b.sort_order
        )
        const completeness = calculateDesignCompleteness(created, images)
        const detailed: ProductWithDetails = {
          ...created,
          product_images: images,
          completeness,
        }

        setProducts((prev) => [detailed, ...prev])
        setSelectedAuditProductId(detailed.id)

        showToast("Saree Created in Database", `"${detailed.name}" is now live on storefront.`, "success")
        return detailed
      } catch (err: any) {
        showToast("Error", err.message || "Failed to create product", "error")
        return null
      }
    },
    [showToast]
  )

  // Delete Saree
  const deleteProduct = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/admin/products?id=${id}`, {
          method: "DELETE",
        })
        const result = await res.json()

        if (!result.success) {
          showToast("Delete Error", result.error || "Failed to delete product from database", "error")
          return false
        }

        setProducts((prev) => {
          const next = prev.filter((p) => p.id !== id)
          if (selectedAuditProductId === id) {
            setSelectedAuditProductId(next.length > 0 ? next[0].id : null)
          }
          return next
        })

        showToast("Product Removed", "Saree deleted from database and storefront.", "info")
        return true
      } catch (err: any) {
        showToast("Error", err.message || "Failed to delete product", "error")
        return false
      }
    },
    [selectedAuditProductId, showToast]
  )

  // =========================================================================
  // IMAGE MUTATIONS: Real Server Sync → product_images table in PostgreSQL
  // =========================================================================

  // Helper to sync updated product_images to database
  const syncProductImagesToDb = useCallback(
    async (productId: string, updatedImages: ProductImage[]): Promise<boolean> => {
      try {
        const res = await fetch("/api/admin/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: productId,
            updates: {},
            product_images: updatedImages,
          }),
        })
        const result = await res.json()
        if (!result.success) {
          console.error("[AdminContext] Failed to sync product images to DB:", result.error)
          showToast("Image Sync Warning", result.error || "Failed to sync images with database.", "error")
          return false
        }
        return true
      } catch (e: any) {
        console.error("[AdminContext] Image sync exception:", e)
        return false
      }
    },
    [showToast]
  )

  // Set Primary Drape Image
  const setProductPrimaryImage = useCallback(
    async (productId: string, imageId: string) => {
      const p = products.find((x) => x.id === productId)
      if (!p) return

      const updatedImages = p.product_images.map((img) => ({
        ...img,
        is_primary: img.id === imageId,
        sort_order: img.id === imageId ? 0 : img.sort_order === 0 ? 1 : img.sort_order,
      }))
      updatedImages.sort((a, b) =>
        a.is_primary ? -1 : b.is_primary ? 1 : a.sort_order - b.sort_order
      )

      // 1. Sync to PostgreSQL
      await syncProductImagesToDb(productId, updatedImages)

      // 2. Update React State
      setProducts((prev) =>
        prev.map((item) => {
          if (item.id !== productId) return item
          const completeness = calculateDesignCompleteness(item, updatedImages)
          return {
            ...item,
            product_images: updatedImages,
            completeness,
          }
        })
      )

      showToast("Cover Drape Synchronized", "Primary image saved to database & customer card.", "success")
    },
    [products, syncProductImagesToDb, showToast]
  )

  // Add Image to Product Gallery
  const addProductImage = useCallback(
    async (productId: string, imageUrl: string, angleOrder?: number) => {
      if (!imageUrl || !imageUrl.trim()) return
      const p = products.find((x) => x.id === productId)
      if (!p) return

      const newImg: ProductImage = {
        id: "img-" + Math.random().toString(36).substring(2, 9),
        product_id: productId,
        image_url: imageUrl.trim(),
        sort_order: angleOrder ?? p.product_images.length,
        is_primary: p.product_images.length === 0,
        created_at: new Date().toISOString(),
      }

      const updatedImages = [...p.product_images, newImg].sort(
        (a, b) => a.sort_order - b.sort_order
      )

      // 1. Sync to PostgreSQL
      await syncProductImagesToDb(productId, updatedImages)

      // 2. Update React State
      setProducts((prev) =>
        prev.map((item) => {
          if (item.id !== productId) return item
          const completeness = calculateDesignCompleteness(item, updatedImages)
          return {
            ...item,
            product_images: updatedImages,
            completeness,
          }
        })
      )

      showToast("Angle Saved to Database", "New visual angle added to live customer gallery.", "success")
    },
    [products, syncProductImagesToDb, showToast]
  )

  // Remove Image from Product
  const removeProductImage = useCallback(
    async (productId: string, imageId: string) => {
      const p = products.find((x) => x.id === productId)
      if (!p) return

      let updatedImages = p.product_images.filter((img) => img.id !== imageId)
      if (updatedImages.length > 0 && !updatedImages.some((img) => img.is_primary)) {
        updatedImages[0].is_primary = true
        updatedImages[0].sort_order = 0
      }

      // 1. Sync to PostgreSQL
      await syncProductImagesToDb(productId, updatedImages)

      // 2. Update React State
      setProducts((prev) =>
        prev.map((item) => {
          if (item.id !== productId) return item
          const completeness = calculateDesignCompleteness(item, updatedImages)
          return {
            ...item,
            product_images: updatedImages,
            completeness,
          }
        })
      )

      showToast("Image Removed", "Photo deleted from database gallery.", "info")
    },
    [products, syncProductImagesToDb, showToast]
  )

  // Reorder Images
  const reorderProductImages = useCallback(
    async (productId: string, newImages: ProductImage[]) => {
      const indexed = newImages.map((img, idx) => ({
        ...img,
        sort_order: idx,
        is_primary: idx === 0,
      }))

      // 1. Sync to PostgreSQL
      await syncProductImagesToDb(productId, indexed)

      // 2. Update React State
      setProducts((prev) =>
        prev.map((item) => {
          if (item.id !== productId) return item
          const completeness = calculateDesignCompleteness(item, indexed)
          return {
            ...item,
            product_images: indexed,
            completeness,
          }
        })
      )

      showToast("Gallery Order Synchronized", "Visual angle priorities saved to database.", "success")
    },
    [syncProductImagesToDb, showToast]
  )

  // Update Order Status
  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus, paymentStatus?: AdminOrder["payment_status"]) => {
      const next = orders.map((o) => {
        if (o.id !== orderId) return o
        return {
          ...o,
          status,
          payment_status: paymentStatus || o.payment_status,
          updated_at: new Date().toISOString(),
        }
      })
      persistOrders(next)

      try {
        await fetch("/api/admin/orders", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, status, paymentStatus }),
        })
      } catch (e) {
        console.warn("[AdminContext] Could not update order on server:", e)
      }

      showToast("Fulfillment Updated", `Order status changed to "${status.toUpperCase()}".`, "success")
    },
    [orders, persistOrders, showToast]
  )

  // 1-Click Accept Order Action
  const acceptOrder = useCallback(
    async (orderId: string) => {
      await updateOrderStatus(orderId, "confirmed")
      showToast("Order Accepted! 🎉", "Customer order is confirmed and ready for packing.", "success")
    },
    [updateOrderStatus, showToast]
  )

  // 1-Click Reject Order Action
  const rejectOrder = useCallback(
    async (orderId: string) => {
      await updateOrderStatus(orderId, "cancelled")
      showToast("Order Rejected", "Order has been marked as cancelled.", "info")
    },
    [updateOrderStatus, showToast]
  )

  // Full Customer & Address Details Update
  const updateOrderDetails = useCallback(
    async (orderId: string, payload: Partial<AdminOrder>): Promise<boolean> => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o
          return {
            ...o,
            ...payload,
            updated_at: new Date().toISOString(),
          }
        })
      )

      try {
        const res = await fetch("/api/admin/orders", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            status: payload.status,
            paymentStatus: payload.payment_status,
            customer_name: payload.customer_name,
            customer_phone: payload.customer_phone,
            customer_email: payload.customer_email,
            address: payload.address,
            notes: payload.notes,
          }),
        })
        const data = await res.json()
        if (data.success) {
          showToast("Order Details Saved", "Customer and delivery address updated successfully.", "success")
          return true
        } else {
          showToast("Save Warning", data.error || "Could not sync to database.", "warning")
          return false
        }
      } catch (e) {
        showToast("Network Error", "Could not reach server.", "error")
        return false
      }
    },
    [showToast]
  )

  // Manual Trigger to Refresh Orders
  const refreshOrders = useCallback(async () => {
    try {
      const ordersRes = await fetch("/api/admin/orders", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      })
      const ordersData = await ordersRes.json()
      if (ordersData.success && Array.isArray(ordersData.orders)) {
        setOrders(ordersData.orders)
        showToast("Live Orders Synced", `${ordersData.orders.length} orders loaded from database.`, "info")
      }
    } catch (e) {
      console.warn("Orders refresh failed:", e)
    }
  }, [showToast])

  // Category Actions
  const updateCategory = useCallback(
    async (id: string, updates: Partial<Category>) => {
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
      try {
        const supabase = createClient()
        await supabase.from("categories").update(updates).eq("id", id)
      } catch (e) {}
      showToast("Category Updated", "Category details saved.", "success")
    },
    [showToast]
  )

  const createCategory = useCallback(
    async (data: Partial<Category>) => {
      const newCat: Category = {
        id: "cat-" + Math.random().toString(36).substring(2, 9),
        name: data.name || "New Category",
        slug:
          data.slug ||
          (data.name || "category").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: data.description || null,
        image_url: data.image_url || null,
        is_active: data.is_active ?? true,
        display_order: categories.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setCategories((prev) => [...prev, newCat])
      try {
        const supabase = createClient()
        await supabase.from("categories").insert([newCat])
      } catch (e) {}
      showToast("Category Created", `"${newCat.name}" added to categories.`, "success")
    },
    [categories, showToast]
  )

  const deleteCategory = useCallback(
    async (id: string) => {
      setCategories((prev) => prev.filter((c) => c.id !== id))
      try {
        const supabase = createClient()
        await supabase.from("categories").delete().eq("id", id)
      } catch (e) {}
      showToast("Category Removed", "Category deleted from database.", "info")
    },
    [showToast]
  )

  // Collection Actions
  const updateCollection = useCallback(
    async (id: string, updates: Partial<Collection>) => {
      setCollections((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
      try {
        const supabase = createClient()
        await supabase.from("collections").update(updates).eq("id", id)
      } catch (e) {}
      showToast("Curated Edit Updated", "Collection details saved.", "success")
    },
    [showToast]
  )

  const createCollection = useCallback(
    async (data: Partial<Collection>) => {
      const newCol: Collection = {
        id: "col-" + Math.random().toString(36).substring(2, 9),
        name: data.name || "New Curated Edit",
        slug:
          data.slug ||
          (data.name || "collection").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: data.description || null,
        image_url: data.image_url || null,
        is_active: data.is_active ?? true,
        display_order: collections.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setCollections((prev) => [...prev, newCol])
      try {
        const supabase = createClient()
        await supabase.from("collections").insert([newCol])
      } catch (e) {}
      showToast("Curated Edit Created", `"${newCol.name}" added to showcases.`, "success")
    },
    [collections, showToast]
  )

  const deleteCollection = useCallback(
    async (id: string) => {
      setCollections((prev) => prev.filter((c) => c.id !== id))
      try {
        const supabase = createClient()
        await supabase.from("collections").delete().eq("id", id)
      } catch (e) {}
      showToast("Curated Edit Removed", "Collection deleted from database.", "info")
    },
    [showToast]
  )

  // Banner Actions
  const updateBanner = useCallback(
    async (id: string, updates: Partial<Banner>) => {
      setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)))
      try {
        const supabase = createClient()
        await supabase.from("banners").update(updates).eq("id", id)
      } catch (e) {}
      showToast("Banner Updated", "Hero banner updated successfully.", "success")
    },
    [showToast]
  )

  const createBanner = useCallback(
    async (data: Partial<Banner>) => {
      const newBanner: Banner = {
        id: "ban-" + Math.random().toString(36).substring(2, 9),
        title: data.title || "Luxury Saree Headline",
        subtitle: data.subtitle || null,
        image_url:
          data.image_url ||
          "https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/banner-images/hero-1.jpg",
        link_url: data.link_url || "/shop",
        is_active: data.is_active ?? true,
        display_order: banners.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setBanners((prev) => [...prev, newBanner])
      try {
        const supabase = createClient()
        await supabase.from("banners").insert([newBanner])
      } catch (e) {}
      showToast("Banner Created", "Hero slide added to carousel.", "success")
    },
    [banners, showToast]
  )

  const deleteBanner = useCallback(
    async (id: string) => {
      setBanners((prev) => prev.filter((b) => b.id !== id))
      try {
        const supabase = createClient()
        await supabase.from("banners").delete().eq("id", id)
      } catch (e) {}
      showToast("Banner Removed", "Slide deleted from hero section.", "info")
    },
    [showToast]
  )

  // Coupon Actions
  const createCoupon = useCallback(
    async (couponData: Partial<AdminCoupon>): Promise<AdminCoupon | null> => {
      try {
        const res = await fetch("/api/admin/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(couponData),
        })
        const data = await res.json()
        if (data.success && data.coupon) {
          setCoupons((prev) => [data.coupon, ...prev.filter((c) => c.id !== data.coupon.id)])
          showToast("Coupon Created", `Promo code "${data.coupon.code}" is now active.`, "success")
          return data.coupon
        }
        showToast("Coupon Error", data.error || "Failed to create coupon", "error")
        return null
      } catch (e: any) {
        showToast("Coupon Error", e.message || "Failed to create coupon", "error")
        return null
      }
    },
    [showToast]
  )

  const updateCoupon = useCallback(
    async (id: string, updates: Partial<AdminCoupon>): Promise<boolean> => {
      setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
      try {
        await fetch("/api/admin/coupons", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, updates }),
        })
        showToast("Coupon Updated", "Promo settings saved.", "success")
        return true
      } catch (e: any) {
        return false
      }
    },
    [showToast]
  )

  const deleteCoupon = useCallback(
    async (id: string): Promise<boolean> => {
      setCoupons((prev) => prev.filter((c) => c.id !== id))
      try {
        await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" })
        showToast("Coupon Removed", "Promo code deleted.", "info")
        return true
      } catch (e) {
        return false
      }
    },
    [showToast]
  )

  const toggleCouponStatus = useCallback(
    async (id: string): Promise<boolean> => {
      const current = coupons.find((c) => c.id === id)
      if (!current) return false
      const newStatus = !current.is_active
      setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, is_active: newStatus } : c)))
      try {
        await fetch("/api/admin/coupons", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, updates: { is_active: newStatus } }),
        })
        showToast(
          newStatus ? "Coupon Activated" : "Coupon Paused",
          `Promo "${current.code}" is ${newStatus ? "LIVE" : "PAUSED"}.`,
          "success"
        )
        return true
      } catch (e) {
        return false
      }
    },
    [coupons, showToast]
  )

  const createManualOrder = useCallback(
    async (orderData: any): Promise<boolean> => {
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        })
        const data = await res.json()
        if (data.success) {
          showToast("Order Booked!", `Order ${data.order_number} created in database.`, "success")
          const ordersRes = await fetch("/api/admin/orders", { cache: "no-store" })
          const ordersData = await ordersRes.json()
          if (ordersData.success && Array.isArray(ordersData.orders)) {
            setOrders(ordersData.orders)
          }
          return true
        }
        showToast("Booking Error", data.error || "Failed to book order", "error")
        return false
      } catch (e: any) {
        showToast("Booking Error", e.message || "Failed to book order", "error")
        return false
      }
    },
    [showToast]
  )

  // Computed Executive Statistics
  const stats = useMemo<AdminStats>(() => {
    const totalSarees = products.length
    const activeCount = products.filter((p) => p.is_active).length
    const activePercentage = totalSarees > 0 ? Math.round((activeCount / totalSarees) * 100) : 0

    const totalCompletenessScore = products.reduce((acc, p) => acc + (p.completeness?.score || 0), 0)
    const designHealthScore = totalSarees > 0 ? Math.round(totalCompletenessScore / totalSarees) : 0

    const totalOrders = orders.length
    const storeRevenue = orders.reduce((acc, o) => acc + (o.payment_status === "paid" ? o.total : 0), 0)
    const pendingOrdersCount = orders.filter(
      (o) => o.status === "pending" || o.status === "confirmed"
    ).length

    let missingFabric = 0
    let missingColor = 0
    let missingOccasion = 0
    let missingImages = 0
    let invalidPricing = 0
    let lowStock = 0
    let needsReview = 0
    let complete = 0

    products.forEach((p) => {
      const c = p.completeness
      if (!c.criteria.fabric.passed) missingFabric++
      if (!c.criteria.color.passed) missingColor++
      if (!c.criteria.occasion.passed) missingOccasion++
      if (!c.criteria.images.passed) missingImages++
      if (!c.criteria.pricing.passed) invalidPricing++
      if (!c.criteria.stockSku.passed || (p.stock !== null && p.stock < 10)) lowStock++
      if (c.score === 100) complete++
      else needsReview++
    })

    return {
      totalSarees,
      activeCatalog: activeCount,
      activePercentage,
      designHealthScore,
      totalOrders,
      storeRevenue,
      pendingOrdersCount,
      checklist: {
        missingFabric,
        missingColor,
        missingOccasion,
        missingImages,
        invalidPricing,
        lowStock,
        needsReview,
        complete,
      },
    }
  }, [products, orders])

  return (
    <AdminContext.Provider
      value={{
        products,
        categories,
        collections,
        banners,
        orders,
        loading,
        isSupabaseLive,
        selectedAuditProductId,
        auditFilter,
        toasts,
        stats,

        setSelectedAuditProductId,
        setAuditFilter,
        showToast,
        removeToast,
        refreshData: loadData,

        updateProduct,
        createProduct,
        deleteProduct,

        setProductPrimaryImage,
        addProductImage,
        removeProductImage,
        reorderProductImages,

        updateOrderStatus,
        acceptOrder,
        rejectOrder,
        updateOrderDetails,
        refreshOrders,

        updateCategory,
        createCategory,
        deleteCategory,
        updateCollection,
        createCollection,
        deleteCollection,

        updateBanner,
        createBanner,
        deleteBanner,

        coupons,
        createCoupon,
        updateCoupon,
        deleteCoupon,
        toggleCouponStatus,

        createManualOrder,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
