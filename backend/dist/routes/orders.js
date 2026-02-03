"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const accountType_1 = require("../middleware/accountType");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const createSchema = zod_1.z.object({
    body: zod_1.z.object({
        customerName: zod_1.z.string().min(1),
        customerMobile: zod_1.z.string().min(6),
        customerAddress: zod_1.z.string().min(3),
        gstin: zod_1.z.string().optional(),
        doctorName: zod_1.z.string().optional(),
        referralCode: zod_1.z.string().optional(),
        items: zod_1.z
            .array(zod_1.z.object({
            product: zod_1.z.string().min(1),
            batch: zod_1.z.string().optional(),
            expiry: zod_1.z.string().optional(),
            quantity: zod_1.z.number().min(1),
            freeQuantity: zod_1.z.number().optional(),
            mrp: zod_1.z.number().optional(),
            rate: zod_1.z.number().optional(),
            discount: zod_1.z.number().optional(),
            cgst: zod_1.z.number().optional(),
            sgst: zod_1.z.number().optional(),
            amount: zod_1.z.number().optional(),
        }))
            .min(1),
    }),
});
const statusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(["PLACED", "CANCELLED", "DELIVERED"]),
    }),
});
const invoiceSchema = zod_1.z.object({
    body: zod_1.z.object({
        invoiceNumber: zod_1.z.string().min(1),
    }),
});
router.use(auth_1.requireAuth);
router.get("/", orderController_1.listOrders);
router.get("/:id", orderController_1.getOrder);
router.post("/", (0, validate_1.validate)(createSchema), orderController_1.createOrderHandler);
router.patch("/:id/status", (0, accountType_1.requireAccountType)("ADMIN", "DISTRIBUTOR"), (0, validate_1.validate)(statusSchema), orderController_1.setOrderStatus);
router.patch("/:id/invoice", (0, role_1.requireRole)("ADMIN"), (0, validate_1.validate)(invoiceSchema), orderController_1.setInvoiceNumber);
exports.default = router;
