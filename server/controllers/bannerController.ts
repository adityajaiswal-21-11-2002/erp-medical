import { Request, Response } from "express"
import BannerAsset from "../models/BannerAsset"
import { sendSuccess } from "../utils/response"
import { logComplianceEvent } from "../services/complianceService"

export async function listBanners(_req: Request, res: Response) {
  const banners = await BannerAsset.find().sort({ createdAt: -1 })
  return sendSuccess(res, banners, "Banners fetched")
}

export async function createBanner(req: Request, res: Response) {
  const banner = await BannerAsset.create({ ...req.body, createdBy: req.user?.id })
  await logComplianceEvent({
    actorId: req.user?.id,
    action: "BANNER_CREATED",
    subjectType: "BannerAsset",
    subjectId: banner._id.toString(),
  })
  return sendSuccess(res, banner, "Banner created")
}

export async function updateBanner(req: Request, res: Response) {
  const banner = await BannerAsset.findByIdAndUpdate(req.params.id, req.body, { new: true })
  return sendSuccess(res, banner, "Banner updated")
}
