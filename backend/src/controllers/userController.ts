import { Request, Response } from "express"
import User from "../models/User"
import AccountProfile from "../models/AccountProfile"
import { AppError } from "../middleware/error"
import { sendSuccess } from "../utils/response"
import { getPagination } from "../utils/pagination"

export async function listUsers(req: Request, res: Response) {
  const { page, limit, skip } = getPagination(req.query)
  const search = String(req.query.search || "").trim()
  const filter: Record<string, unknown> = {}
  if (search) {
    filter.$or = [
      { name: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
      { mobile: new RegExp(search, "i") },
    ]
  }
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select("-password"),
    User.countDocuments(filter),
  ])
  const profiles = await AccountProfile.find({ userId: { $in: items.map((u) => u._id) } })
  const profileMap = new Map(
    profiles.map((profile) => [profile.userId.toString(), profile]),
  )
  const enriched = items.map((user) => {
    const profile = profileMap.get(user._id.toString())
    return {
      ...user.toObject(),
      accountType: profile?.accountType,
      kycStatus: profile?.kycStatus,
      profileStatus: profile?.status,
    }
  })
  return sendSuccess(res, { items: enriched, total, page, limit }, "Users fetched")
}

export async function createUser(req: Request, res: Response) {
  const { name, email, password, mobile, role, accountType } = req.body
  const user = await User.create({
    name,
    email,
    password,
    mobile,
    role,
    createdBy: req.user?.id,
  })
  const resolvedAccountType = accountType || (role === "ADMIN" ? "ADMIN" : "RETAILER")
  await AccountProfile.create({
    userId: user._id,
    accountType: resolvedAccountType,
  })
  return sendSuccess(
    res,
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      accountType: resolvedAccountType,
    },
    "User created",
  )
}

export async function updateUser(req: Request, res: Response) {
  const { id } = req.params
  const updates: Record<string, unknown> = {}
  const { name, mobile, status, role, accountType, profileStatus } = req.body
  if (name !== undefined) updates.name = name
  if (mobile !== undefined) updates.mobile = mobile
  if (status !== undefined) updates.status = status
  if (role !== undefined) updates.role = role

  const user = await User.findByIdAndUpdate(id, updates, { new: true }).select("-password")
  if (!user) {
    throw new AppError("User not found", 404)
  }
  if (accountType || profileStatus) {
    await AccountProfile.findOneAndUpdate(
      { userId: id },
      {
        ...(accountType ? { accountType } : {}),
        ...(profileStatus ? { status: profileStatus } : {}),
      },
      { upsert: true },
    )
  }
  return sendSuccess(res, user, "User updated")
}

export async function resetUserPassword(req: Request, res: Response) {
  const { id } = req.params
  const { password } = req.body
  const user = await User.findById(id)
  if (!user) {
    throw new AppError("User not found", 404)
  }
  user.password = password
  await user.save()
  return sendSuccess(res, null, "Password reset")
}

export async function deleteUser(req: Request, res: Response) {
  const { id } = req.params
  const user = await User.findByIdAndUpdate(
    id,
    { status: "BLOCKED" },
    { new: true },
  ).select("-password")
  if (!user) {
    throw new AppError("User not found", 404)
  }
  return sendSuccess(res, user, "User blocked")
}
