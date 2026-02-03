import { Request, Response } from "express"
import AnalyticsEvent from "../models/AnalyticsEvent"
import { sendSuccess } from "../utils/response"

export async function ingestEvent(req: Request, res: Response) {
  const event = await AnalyticsEvent.create({
    userId: req.user?.id,
    accountType: req.user?.accountType,
    eventType: req.body.eventType,
    metadata: req.body.metadata || {},
  })
  return sendSuccess(res, event, "Event recorded")
}

export async function getAnalyticsSummary(_req: Request, res: Response) {
  const totals = await AnalyticsEvent.aggregate([
    { $group: { _id: "$eventType", count: { $sum: 1 } } },
  ])
  const byEvent = totals.reduce((acc: Record<string, number>, row) => {
    acc[row._id] = row.count
    return acc
  }, {})
  const topSearches = await AnalyticsEvent.aggregate([
    { $match: { eventType: "search" } },
    { $group: { _id: "$metadata.query", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ])
  return sendSuccess(
    res,
    { totals: byEvent, topSearches },
    "Analytics summary fetched",
  )
}
