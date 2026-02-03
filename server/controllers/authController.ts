import { Request, Response } from "express"
import User from "../models/User"
import AccountProfile from "../models/AccountProfile"
import { AppError } from "../middleware/error"
import { sendSuccess } from "../utils/response"
import { signAccessToken } from "../utils/token"

export async function register(req: Request, res: Response) {
  const existingCount = await User.countDocuments()
  if (existingCount > 0) {
    if (!req.user || req.user.role !== "ADMIN") {
      throw new AppError("Only admin can create users", 403)
    }
  }

  const { name, email, password, mobile, role, accountType, consent } = req.body
  const user = await User.create({
    name,
    email,
    password,
    mobile,
    role: existingCount === 0 ? "ADMIN" : role || "USER",
    createdBy: req.user?.id,
  })
  const resolvedAccountType =
    existingCount === 0
      ? "ADMIN"
      : accountType ||
        (user.role === "ADMIN" ? "ADMIN" : "RETAILER")
  await AccountProfile.create({
    userId: user._id,
    accountType: resolvedAccountType,
    consent: consent || {},
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
    "User registered",
  )
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user) {
    throw new AppError("Invalid credentials", 401)
  }
  if (user.status === "BLOCKED") {
    throw new AppError("User is blocked", 403)
  }
  const ok = await user.comparePassword(password)
  if (!ok) {
    throw new AppError("Invalid credentials", 401)
  }
  user.lastLogin = new Date()
  await user.save()

  let profile = await AccountProfile.findOne({ userId: user._id })
  if (!profile) {
    profile = await AccountProfile.create({
      userId: user._id,
      accountType: user.role === "ADMIN" ? "ADMIN" : "RETAILER",
    })
  }
  const token = signAccessToken({ userId: user._id.toString(), role: user.role })
  return sendSuccess(
    res,
    {
      accessToken: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountType: profile.accountType,
        kycStatus: profile.kycStatus,
      },
    },
    "Login successful",
  )
}

export async function logout(_req: Request, res: Response) {
  return sendSuccess(res, null, "Logged out")
}

export async function me(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError("Unauthorized", 401)
  }
  const profile = await AccountProfile.findOne({ userId: req.user.id })
  return sendSuccess(
    res,
    {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      status: req.user.status,
      accountType: profile?.accountType,
      kycStatus: profile?.kycStatus,
      consent: profile?.consent,
    },
    "Profile fetched",
  )
}
