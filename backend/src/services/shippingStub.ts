/** Stub for tests; real implementation in server/ uses Shiprocket/RapidShyp */
export function getShippingProvider(_name: "SHIPROCKET" | "RAPIDSHYP") {
  return {
    auth: () => Promise.resolve(),
    createOrderFromInternal: (order: { orderNumber: string }) =>
      Promise.resolve({
        providerOrderId: `mock-${order.orderNumber}-${Date.now()}`,
        shipmentId: "ship-1",
        awb: "AWB123456",
        courierName: "Mock Courier",
        status: "AWB_ASSIGNED" as const,
        raw: {},
      }),
    assignShipment: (_providerOrderId?: string) =>
      Promise.resolve({
        awb: "AWB123456",
        courierName: "Mock Courier",
        status: "AWB_ASSIGNED" as const,
      }),
    generateAwb: () =>
      Promise.resolve({
        awb: "AWB123456",
        courierName: "Mock Courier",
        status: "AWB_ASSIGNED" as const,
      }),
    track: (_identifier?: string) =>
      Promise.resolve({
        status: "IN_TRANSIT" as const,
        tracking: {},
      }),
    cancel: () => Promise.resolve({ success: true }),
  }
}

export function getDefaultShippingProvider(): "SHIPROCKET" | "RAPIDSHYP" {
  return "SHIPROCKET"
}
