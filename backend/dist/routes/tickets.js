"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const ticketController_1 = require("../controllers/ticketController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const createSchema = zod_1.z.object({
    body: zod_1.z.object({
        subject: zod_1.z.string().min(3),
        description: zod_1.z.string().min(5),
        priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    }),
});
const updateSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        status: zod_1.z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]).optional(),
        priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
        assignedTo: zod_1.z.string().optional(),
    })
        .refine((val) => Object.keys(val).length > 0),
});
router.use(auth_1.requireAuth);
router.get("/", ticketController_1.listTickets);
router.post("/", (0, validate_1.validate)(createSchema), ticketController_1.createTicket);
router.patch("/:id", (0, validate_1.validate)(updateSchema), ticketController_1.updateTicket);
exports.default = router;
