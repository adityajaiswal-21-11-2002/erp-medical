"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMockProducts = getMockProducts;
exports.getMockInventory = getMockInventory;
exports.getMockInvoices = getMockInvoices;
exports.getMockSettlements = getMockSettlements;
function getMockProducts() {
    return [
        {
            sku: "SWIL-PARA-500",
            name: "Paracetamol 500",
            mrp: 35,
            ptr: 28,
            currentStock: 200,
        },
        {
            sku: "SWIL-AZI-250",
            name: "Azithromycin 250",
            mrp: 80,
            ptr: 65,
            currentStock: 120,
        },
    ];
}
function getMockInventory() {
    return [
        { sku: "SWIL-PARA-500", available: 200, reserved: 12 },
        { sku: "SWIL-AZI-250", available: 120, reserved: 5 },
    ];
}
function getMockInvoices() {
    return [
        { invoiceNumber: "INV-1001", amount: 12000, status: "PAID" },
        { invoiceNumber: "INV-1002", amount: 8400, status: "PENDING" },
    ];
}
function getMockSettlements() {
    return [
        { retailer: "North Star Medicals", outstanding: 12000, ageingDays: 12 },
        { retailer: "CarePlus Pharmacy", outstanding: 8400, ageingDays: 18 },
    ];
}
