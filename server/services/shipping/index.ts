import { env } from "../../config/env"
import type { ShippingProvider, ShippingProviderName } from "./types"
import * as Shiprocket from "./ShiprocketProvider"
import * as RapidShyp from "./RapidShypProvider"

export type { ShippingProvider, ShippingProviderName, ShipmentStatus, InternalOrderForShipping }
export { mapProviderStatusToInternal } from "./types"
export { logShippingAction } from "./ShippingLog"

const shiprocketProvider: ShippingProvider = {
  auth: Shiprocket.auth,
  createOrderFromInternal: Shiprocket.createOrderFromInternal,
  assignShipment: Shiprocket.assignShipment,
  generateAwb: Shiprocket.generateAwb,
  track: Shiprocket.track,
  cancel: Shiprocket.cancel,
}

const rapidshypProvider: ShippingProvider = {
  auth: RapidShyp.auth,
  createOrderFromInternal: RapidShyp.createOrderFromInternal,
  assignShipment: RapidShyp.assignShipment,
  generateAwb: RapidShyp.generateAwb,
  track: RapidShyp.track,
  cancel: RapidShyp.cancel,
}

export function getShippingProvider(name: ShippingProviderName): ShippingProvider {
  if (name === "SHIPROCKET") return shiprocketProvider
  if (name === "RAPIDSHYP") return rapidshypProvider
  throw new Error(`Unknown shipping provider: ${name}`)
}

export function getDefaultShippingProvider(): ShippingProviderName {
  return env.defaultShippingProvider
}
