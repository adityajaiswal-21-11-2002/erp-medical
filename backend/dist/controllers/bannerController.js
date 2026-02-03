"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBanners = listBanners;
exports.createBanner = createBanner;
exports.updateBanner = updateBanner;
const BannerAsset_1 = __importDefault(require("../models/BannerAsset"));
const response_1 = require("../utils/response");
const complianceService_1 = require("../services/complianceService");
async function listBanners(_req, res) {
    const banners = await BannerAsset_1.default.find().sort({ createdAt: -1 });
    return (0, response_1.sendSuccess)(res, banners, "Banners fetched");
}
async function createBanner(req, res) {
    const banner = await BannerAsset_1.default.create({ ...req.body, createdBy: req.user?.id });
    await (0, complianceService_1.logComplianceEvent)({
        actorId: req.user?.id,
        action: "BANNER_CREATED",
        subjectType: "BannerAsset",
        subjectId: banner._id.toString(),
    });
    return (0, response_1.sendSuccess)(res, banner, "Banner created");
}
async function updateBanner(req, res) {
    const banner = await BannerAsset_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return (0, response_1.sendSuccess)(res, banner, "Banner updated");
}
