import { Request, Response } from "express"
import Product from "../models/Product"
import { AppError } from "../middleware/error"
import { sendSuccess } from "../utils/response"
import { getPagination } from "../utils/pagination"

export async function listProducts(req: Request, res: Response) {
  const { page, limit, skip } = getPagination(req.query)
  const search = String(req.query.search || "").trim()
  const category = String(req.query.category || "").trim()
  const status = String(req.query.status || "").trim()
  const stockStatus = String(req.query.stockStatus || "").trim()

  const filter: Record<string, unknown> = {}
  if (search) {
    filter.$or = [
      { name: new RegExp(search, "i") },
      { genericName: new RegExp(search, "i") },
    ]
  }
  if (category) filter.category = category
  if (status) filter.status = status
  if (stockStatus) filter.stockStatus = stockStatus

  const sortBy = String(req.query.sortBy || "createdAt")
  const sortOrder = String(req.query.sortOrder || "desc") === "asc" ? 1 : -1
  const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder }

  const [items, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ])
  const enriched = items.map((item) => ({
    ...item.toObject(),
    legalMetrology: {
      hasMrp: Boolean(item.mrp),
      hasNetQty: Boolean(item.netMrp || item.unitsPerPack),
      hasBatch: Boolean(item.batch),
      hasExpiry: Boolean(item.expiryDate || item.shelfLife),
      compliant: Boolean(item.mrp && (item.netMrp || item.unitsPerPack) && item.hsnCode),
    },
  }))
  return sendSuccess(res, { items: enriched, total, page, limit }, "Products fetched")
}

export async function getProduct(req: Request, res: Response) {
  const product = await Product.findById(req.params.id)
  if (!product) {
    throw new AppError("Product not found", 404)
  }
  return sendSuccess(
    res,
    {
      ...product.toObject(),
      legalMetrology: {
        hasMrp: Boolean(product.mrp),
        hasNetQty: Boolean(product.netMrp || product.unitsPerPack),
        hasBatch: Boolean(product.batch),
        hasExpiry: Boolean(product.expiryDate || product.shelfLife),
        compliant: Boolean(product.mrp && (product.netMrp || product.unitsPerPack) && product.hsnCode),
      },
    },
    "Product fetched",
  )
}

export async function createProduct(req: Request, res: Response) {
  const product = await Product.create({ ...req.body, createdBy: req.user?.id })
  return sendSuccess(res, product, "Product created")
}

export async function updateProduct(req: Request, res: Response) {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  })
  if (!product) {
    throw new AppError("Product not found", 404)
  }
  return sendSuccess(res, product, "Product updated")
}

export async function deleteProduct(req: Request, res: Response) {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { status: "INACTIVE" },
    { new: true },
  )
  if (!product) {
    throw new AppError("Product not found", 404)
  }
  return sendSuccess(res, product, "Product deactivated")
}

export async function updateProductPhoto(req: Request, res: Response) {
  const { photoBase64 } = req.body
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { photoBase64 },
    { new: true },
  )
  if (!product) {
    throw new AppError("Product not found", 404)
  }
  return sendSuccess(res, product, "Product photo updated")
}
