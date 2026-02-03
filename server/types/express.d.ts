declare namespace Express {
  export interface Request {
    user?: {
      id: string
      role: "ADMIN" | "USER"
      email: string
      name: string
      status: "ACTIVE" | "BLOCKED"
      accountType?: "ADMIN" | "RETAILER" | "DISTRIBUTOR" | "CUSTOMER"
    }
  }
}
