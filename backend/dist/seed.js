"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./config/db");
const User_1 = __importDefault(require("./models/User"));
const Product_1 = __importDefault(require("./models/Product"));
const AccountProfile_1 = __importDefault(require("./models/AccountProfile"));
const FeatureFlag_1 = __importDefault(require("./models/FeatureFlag"));
const RewardCatalog_1 = __importDefault(require("./models/RewardCatalog"));
const BannerAsset_1 = __importDefault(require("./models/BannerAsset"));
const Coupon_1 = __importDefault(require("./models/Coupon"));
async function run() {
    await (0, db_1.connectDb)();
    let admin = await User_1.default.findOne({ email: "admin@demo.com" });
    if (!admin) {
        admin = await User_1.default.create({
            name: "Admin",
            email: "admin@demo.com",
            password: "Admin@123",
            mobile: "9999999999",
            role: "ADMIN",
        });
    }
    await AccountProfile_1.default.findOneAndUpdate({ userId: admin._id }, { accountType: "ADMIN", kycStatus: "APPROVED" }, { upsert: true });
    const retailer = await User_1.default.findOne({ email: "user@demo.com" });
    if (!retailer) {
        const created = await User_1.default.create({
            name: "Retailer",
            email: "user@demo.com",
            password: "User@123",
            mobile: "8888888888",
            role: "USER",
            createdBy: admin?._id,
        });
        await AccountProfile_1.default.findOneAndUpdate({ userId: created._id }, { accountType: "RETAILER", kycStatus: "PENDING" }, { upsert: true });
    }
    const distributor = await User_1.default.findOne({ email: "distributor@demo.com" });
    if (!distributor) {
        const created = await User_1.default.create({
            name: "Distributor",
            email: "distributor@demo.com",
            password: "Distributor@123",
            mobile: "7777777777",
            role: "USER",
            createdBy: admin?._id,
        });
        await AccountProfile_1.default.findOneAndUpdate({ userId: created._id }, { accountType: "DISTRIBUTOR", kycStatus: "APPROVED" }, { upsert: true });
    }
    const customer = await User_1.default.findOne({ email: "customer@demo.com" });
    if (!customer) {
        const created = await User_1.default.create({
            name: "Customer",
            email: "customer@demo.com",
            password: "Customer@123",
            mobile: "6666666666",
            role: "USER",
            createdBy: admin?._id,
        });
        await AccountProfile_1.default.findOneAndUpdate({ userId: created._id }, { accountType: "CUSTOMER", kycStatus: "NOT_STARTED" }, { upsert: true });
    }
    const productCount = await Product_1.default.countDocuments();
    if (productCount === 0) {
        await Product_1.default.insertMany([
            {
                name: "Paracetamol 500",
                genericName: "Paracetamol",
                packaging: "10x10",
                dosageForm: "Tablet",
                category: "Analgesic",
                pts: 25,
                ptr: 28,
                netMrp: 30,
                mrp: 35,
                gstPercent: 5,
                hsnCode: "3004",
                shelfLife: "12/2026",
                currentStock: 200,
                strength: "500mg",
                manufacturerName: "Health Labs",
                stockStatus: "IN_STOCK",
                status: "ACTIVE",
                createdBy: admin?._id,
            },
            {
                name: "Azithromycin 250",
                genericName: "Azithromycin",
                packaging: "1x6",
                dosageForm: "Tablet",
                category: "Antibiotic",
                pts: 60,
                ptr: 65,
                netMrp: 70,
                mrp: 80,
                gstPercent: 12,
                hsnCode: "3004",
                shelfLife: "08/2026",
                currentStock: 120,
                strength: "250mg",
                manufacturerName: "Medicare",
                stockStatus: "IN_STOCK",
                status: "ACTIVE",
                createdBy: admin?._id,
            },
            {
                name: "Cetirizine 10",
                genericName: "Cetirizine",
                packaging: "10x10",
                dosageForm: "Tablet",
                category: "Antihistamine",
                pts: 35,
                ptr: 40,
                netMrp: 45,
                mrp: 50,
                gstPercent: 5,
                hsnCode: "3004",
                shelfLife: "10/2026",
                currentStock: 150,
                strength: "10mg",
                manufacturerName: "AllerCare",
                stockStatus: "IN_STOCK",
                status: "ACTIVE",
                createdBy: admin?._id,
            },
            {
                name: "Pantoprazole 40",
                genericName: "Pantoprazole",
                packaging: "10x10",
                dosageForm: "Tablet",
                category: "Gastro",
                pts: 55,
                ptr: 60,
                netMrp: 65,
                mrp: 75,
                gstPercent: 12,
                hsnCode: "3004",
                shelfLife: "09/2026",
                currentStock: 140,
                strength: "40mg",
                manufacturerName: "Digest Pharma",
                stockStatus: "IN_STOCK",
                status: "ACTIVE",
                createdBy: admin?._id,
            },
            {
                name: "Ibuprofen 400",
                genericName: "Ibuprofen",
                packaging: "10x10",
                dosageForm: "Tablet",
                category: "Analgesic",
                pts: 30,
                ptr: 34,
                netMrp: 38,
                mrp: 45,
                gstPercent: 5,
                hsnCode: "3004",
                shelfLife: "11/2026",
                currentStock: 180,
                strength: "400mg",
                manufacturerName: "Relief Labs",
                stockStatus: "IN_STOCK",
                status: "ACTIVE",
                createdBy: admin?._id,
            },
            {
                name: "Amoxicillin 500",
                genericName: "Amoxicillin",
                packaging: "10x6",
                dosageForm: "Capsule",
                category: "Antibiotic",
                pts: 75,
                ptr: 80,
                netMrp: 88,
                mrp: 95,
                gstPercent: 12,
                hsnCode: "3004",
                shelfLife: "07/2026",
                currentStock: 110,
                strength: "500mg",
                manufacturerName: "BioCare",
                stockStatus: "IN_STOCK",
                status: "ACTIVE",
                createdBy: admin?._id,
            },
        ]);
    }
    await FeatureFlag_1.default.findOneAndUpdate({ key: "RETURNS_ENABLED" }, { enabled: true }, { upsert: true });
    await FeatureFlag_1.default.findOneAndUpdate({ key: "COUPONS_ENABLED" }, { enabled: true }, { upsert: true });
    const rewardsCount = await RewardCatalog_1.default.countDocuments();
    if (rewardsCount === 0) {
        await RewardCatalog_1.default.insertMany([
            { name: "Starter Scratch Card", type: "SCRATCH_CARD", pointsCost: 0, rules: "Random bonus" },
            { name: "Magic Store Voucher", type: "MAGIC_STORE", pointsCost: 200, rules: "Redeem for perks" },
        ]);
    }
    const bannerCount = await BannerAsset_1.default.countDocuments();
    if (bannerCount === 0) {
        await BannerAsset_1.default.insertMany([
            { title: "Welcome Offer", description: "5% off on first order", placement: "CUSTOMER" },
            { title: "Retailer Promo", description: "Bulk discounts active", placement: "RETAILER" },
        ]);
    }
    const couponCount = await Coupon_1.default.countDocuments();
    if (couponCount === 0) {
        await Coupon_1.default.insertMany([
            { code: "WELCOME5", description: "5% off", discountPercent: 5, active: true },
            { code: "BULK10", description: "10% off bulk orders", discountPercent: 10, active: true },
        ]);
    }
    console.log("Seed complete");
    process.exit(0);
}
run().catch((err) => {
    console.error(err);
    process.exit(1);
});
