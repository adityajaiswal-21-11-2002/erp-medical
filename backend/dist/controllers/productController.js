"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProducts = listProducts;
exports.getProduct = getProduct;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.updateProductPhoto = updateProductPhoto;
const Product_1 = __importDefault(require("../models/Product"));
const error_1 = require("../middleware/error");
const response_1 = require("../utils/response");
const pagination_1 = require("../utils/pagination");
async function listProducts(req, res) {
    const { page, limit, skip } = (0, pagination_1.getPagination)(req.query);
    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();
    const status = String(req.query.status || "").trim();
    const stockStatus = String(req.query.stockStatus || "").trim();
    const filter = {};
    if (search) {
        filter.$or = [
            { name: new RegExp(search, "i") },
            { genericName: new RegExp(search, "i") },
        ];
    }
    if (category)
        filter.category = category;
    if (status)
        filter.status = status;
    if (stockStatus)
        filter.stockStatus = stockStatus;
    const sortBy = String(req.query.sortBy || "createdAt");
    const sortOrder = String(req.query.sortOrder || "desc") === "asc" ? 1 : -1;
    const sort = { [sortBy]: sortOrder };
    const [items, total] = await Promise.all([
        Product_1.default.find(filter).sort(sort).skip(skip).limit(limit),
        Product_1.default.countDocuments(filter),
    ]);
    const enriched = items.map((item) => ({
        ...item.toObject(),
        legalMetrology: {
            hasMrp: Boolean(item.mrp),
            hasNetQty: Boolean(item.netMrp || item.unitsPerPack),
            hasBatch: Boolean(item.batch),
            hasExpiry: Boolean(item.expiryDate || item.shelfLife),
            compliant: Boolean(item.mrp && (item.netMrp || item.unitsPerPack) && item.hsnCode),
        },
    }));
    return (0, response_1.sendSuccess)(res, { items: enriched, total, page, limit }, "Products fetched");
}
async function getProduct(req, res) {
    const product = await Product_1.default.findById(req.params.id);
    if (!product) {
        throw new error_1.AppError("Product not found", 404);
    }
    return (0, response_1.sendSuccess)(res, {
        ...product.toObject(),
        legalMetrology: {
            hasMrp: Boolean(product.mrp),
            hasNetQty: Boolean(product.netMrp || product.unitsPerPack),
            hasBatch: Boolean(product.batch),
            hasExpiry: Boolean(product.expiryDate || product.shelfLife),
            compliant: Boolean(product.mrp && (product.netMrp || product.unitsPerPack) && product.hsnCode),
        },
    }, "Product fetched");
}
async function createProduct(req, res) {
    const product = await Product_1.default.create({ ...req.body, createdBy: req.user?.id });
    return (0, response_1.sendSuccess)(res, product, "Product created");
}
async function updateProduct(req, res) {
    const product = await Product_1.default.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });
    if (!product) {
        throw new error_1.AppError("Product not found", 404);
    }
    return (0, response_1.sendSuccess)(res, product, "Product updated");
}
async function deleteProduct(req, res) {
    const product = await Product_1.default.findByIdAndUpdate(req.params.id, { status: "INACTIVE" }, { new: true });
    if (!product) {
        throw new error_1.AppError("Product not found", 404);
    }
    return (0, response_1.sendSuccess)(res, product, "Product deactivated");
}
async function updateProductPhoto(req, res) {
    const { photoBase64 } = req.body;
    const product = await Product_1.default.findByIdAndUpdate(req.params.id, { photoBase64 }, { new: true });
    if (!product) {
        throw new error_1.AppError("Product not found", 404);
    }
    return (0, response_1.sendSuccess)(res, product, "Product photo updated");
}
