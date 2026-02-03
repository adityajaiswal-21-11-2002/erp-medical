"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTickets = listTickets;
exports.createTicket = createTicket;
exports.updateTicket = updateTicket;
const Ticket_1 = __importDefault(require("../models/Ticket"));
const response_1 = require("../utils/response");
async function listTickets(req, res) {
    const filter = {};
    if (req.user?.accountType !== "ADMIN") {
        filter.createdBy = req.user?.id;
    }
    const tickets = await Ticket_1.default.find(filter).sort({ createdAt: -1 });
    return (0, response_1.sendSuccess)(res, tickets, "Tickets fetched");
}
async function createTicket(req, res) {
    const ticket = await Ticket_1.default.create({
        createdBy: req.user?.id,
        accountType: req.user?.accountType || "RETAILER",
        subject: req.body.subject,
        description: req.body.description,
        priority: req.body.priority || "MEDIUM",
    });
    return (0, response_1.sendSuccess)(res, ticket, "Ticket created");
}
async function updateTicket(req, res) {
    const ticket = await Ticket_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return (0, response_1.sendSuccess)(res, ticket, "Ticket updated");
}
