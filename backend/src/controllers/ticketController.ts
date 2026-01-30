import { Request, Response } from "express"
import Ticket from "../models/Ticket"
import { sendSuccess } from "../utils/response"

export async function listTickets(req: Request, res: Response) {
  const filter: Record<string, unknown> = {}
  if (req.user?.accountType !== "ADMIN") {
    filter.createdBy = req.user?.id
  }
  const tickets = await Ticket.find(filter).sort({ createdAt: -1 })
  return sendSuccess(res, tickets, "Tickets fetched")
}

export async function createTicket(req: Request, res: Response) {
  const ticket = await Ticket.create({
    createdBy: req.user?.id,
    accountType: req.user?.accountType || "RETAILER",
    subject: req.body.subject,
    description: req.body.description,
    priority: req.body.priority || "MEDIUM",
  })
  return sendSuccess(res, ticket, "Ticket created")
}

export async function updateTicket(req: Request, res: Response) {
  const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true })
  return sendSuccess(res, ticket, "Ticket updated")
}
