"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const productSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1),
        genericName: zod_1.z.string().min(1),
        packaging: zod_1.z.string().min(1),
        dosageForm: zod_1.z.string().min(1),
        category: zod_1.z.string().min(1),
        pts: zod_1.z.number(),
        ptr: zod_1.z.number(),
        netMrp: zod_1.z.number(),
        mrp: zod_1.z.number(),
        gstPercent: zod_1.z.union([zod_1.z.literal(0), zod_1.z.literal(5), zod_1.z.literal(12)]),
        hsnCode: zod_1.z.string().min(1),
        shelfLife: zod_1.z.string().min(1),
        currentStock: zod_1.z.number(),
        strength: zod_1.z.string().optional(),
        manufacturerName: zod_1.z.string().optional(),
        batch: zod_1.z.string().optional(),
        manufacturingDate: zod_1.z.string().optional(),
        expiryDate: zod_1.z.string().optional(),
        drugLicenseNumber: zod_1.z.string().optional(),
        scheduleType: zod_1.z.enum(["NON", "H", "H1", "X"]).optional(),
        packType: zod_1.z.string().optional(),
        unitsPerPack: zod_1.z.number().optional(),
        freeQuantity: zod_1.z.number().optional(),
        sellingRate: zod_1.z.number().optional(),
        discountPercent: zod_1.z.number().optional(),
        discountValue: zod_1.z.number().optional(),
        cgst: zod_1.z.number().optional(),
        sgst: zod_1.z.number().optional(),
        taxableValue: zod_1.z.number().optional(),
        totalGstAmount: zod_1.z.number().optional(),
        openingStock: zod_1.z.number().optional(),
        minimumStockAlert: zod_1.z.number().optional(),
        stockUnit: zod_1.z.enum(["Strip", "Box", "Bottle"]).optional(),
        stockStatus: zod_1.z.enum(["IN_STOCK", "LOW", "OUT"]).optional(),
        status: zod_1.z.enum(["ACTIVE", "INACTIVE"]).optional(),
        photoBase64: zod_1.z.string().optional(),
    }),
});
const productUpdateSchema = zod_1.z.object({
    body: productSchema.shape.body.partial().refine((val) => Object.keys(val).length > 0),
});
const photoSchema = zod_1.z.object({
    body: zod_1.z.object({
        photoBase64: zod_1.z.string().min(1),
    }),
});
router.get("/", productController_1.listProducts);
router.get("/:id", productController_1.getProduct);
router.post("/", auth_1.requireAuth, (0, role_1.requireRole)("ADMIN"), (0, validate_1.validate)(productSchema), productController_1.createProduct);
router.patch("/:id", auth_1.requireAuth, (0, role_1.requireRole)("ADMIN"), (0, validate_1.validate)(productUpdateSchema), productController_1.updateProduct);
router.delete("/:id", auth_1.requireAuth, (0, role_1.requireRole)("ADMIN"), productController_1.deleteProduct);
router.post("/:id/photo", auth_1.requireAuth, (0, role_1.requireRole)("ADMIN"), (0, validate_1.validate)(photoSchema), productController_1.updateProductPhoto);
exports.default = router;
