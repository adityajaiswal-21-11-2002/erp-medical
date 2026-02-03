import { Request, Response } from "express"
import AccountProfile from "../models/AccountProfile"
import KycSubmission from "../models/KycSubmission"
import { AppError } from "../middleware/error"
import { sendSuccess } from "../utils/response"
import { logComplianceEvent } from "../services/complianceService"

export async function submitKyc(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError("Unauthorized", 401)
  }
  const submission = await KycSubmission.create({
    retailerId: req.user.id,
    status: "PENDING",
    businessName: req.body.businessName,
    gstin: req.body.gstin,
    drugLicenseNumber: req.body.drugLicenseNumber,
    address: req.body.address,
    documents: req.body.documents || [],
  })
  await AccountProfile.findOneAndUpdate(
    { userId: req.user.id },
    { kycStatus: "PENDING" },
    { upsert: true },
  )
  await logComplianceEvent({
    actorId: req.user.id,
    action: "KYC_SUBMITTED",
    subjectType: "KycSubmission",
    subjectId: submission._id.toString(),
  })
  return sendSuccess(res, submission, "KYC submitted")
}

export async function getKycStatus(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError("Unauthorized", 401)
  }
  const profile = await AccountProfile.findOne({ userId: req.user.id })
  const latest = await KycSubmission.findOne({ retailerId: req.user.id }).sort({ createdAt: -1 })
  return sendSuccess(
    res,
    {
      kycStatus: profile?.kycStatus || "NOT_STARTED",
      submission: latest,
    },
    "KYC status fetched",
  )
}

export async function listKycSubmissions(_req: Request, res: Response) {
  const items = await KycSubmission.find().sort({ createdAt: -1 })
  return sendSuccess(res, items, "KYC submissions fetched")
}

export async function reviewKyc(req: Request, res: Response) {
  const submission = await KycSubmission.findById(req.params.id)
  if (!submission) {
    throw new AppError("Submission not found", 404)
  }
  submission.status = req.body.status
  submission.rejectionReason = req.body.rejectionReason
  submission.reviewedBy = req.user?.id
  await submission.save()
  await AccountProfile.findOneAndUpdate(
    { userId: submission.retailerId },
    { kycStatus: req.body.status === "APPROVED" ? "APPROVED" : "REJECTED" },
    { upsert: true },
  )
  await logComplianceEvent({
    actorId: req.user?.id,
    action: "KYC_REVIEWED",
    subjectType: "KycSubmission",
    subjectId: submission._id.toString(),
    metadata: { status: req.body.status },
  })
  return sendSuccess(res, submission, "KYC reviewed")
}
