import { isDBConnected } from "../db.js";
import { defaultPartners } from "../data/defaultPartners.js";
import { PartnerModel, SystemSettingsModel } from "../models/index.js";

const PARTNERS_SEED_MARKER = "partners_seeded_v5";
const requiredPartnerFields = [
  "nameAr", "nameEn", "logo", "descriptionAr", "descriptionEn",
  "partnershipAr", "partnershipEn", "servicesAr", "servicesEn",
] as const;

export async function ensureDefaultPartners(): Promise<void> {
  if (!isDBConnected()) return;
  const marker = await SystemSettingsModel.findOne({ key: PARTNERS_SEED_MARKER }).lean();
  if (marker) return;

  await PartnerModel.init();
  const existingCount = await PartnerModel.countDocuments();

  const incompleteConditions = requiredPartnerFields.flatMap((field) => [
    { [field]: { $exists: false } },
    { [field]: null },
    { [field]: "" },
  ]);
  const draftResult = await PartnerModel.updateMany(
    { $or: incompleteConditions },
    { $set: { isPublished: false }, $unset: { seedKey: 1 } },
  );

  const operations = defaultPartners.map((partner) => {
    const { seedKey, ...insertDefaults } = partner;
    return {
      updateOne: {
        filter: { seedKey },
        update: { $set: { seedKey }, $setOnInsert: insertDefaults },
        upsert: true,
      },
    };
  });
  const result = await PartnerModel.bulkWrite(operations, { ordered: false });

  await SystemSettingsModel.findOneAndUpdate(
    { key: PARTNERS_SEED_MARKER },
    { key: PARTNERS_SEED_MARKER, value: true, group: "migrations", label: "Default partners seeded" },
    { upsert: true, new: true },
  );
  console.log(`✅ Partner initialization: kept ${existingCount}, added ${result.upsertedCount} defaults, drafted ${draftResult.modifiedCount} incomplete legacy records`);
}