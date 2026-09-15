import { CountryModel } from "../models/Country.js";
import { countryCatalog, findCountryCatalogEntry } from "../data/countryCatalog.js";

const defaultDescriptions: Record<string, [string, string]> = {
  PK: ["كوادر متخصصة في التقنية والإنشاءات والخدمات.", "Specialist talent across technology, construction, and services."],
  IN: ["خبرات في الهندسة والتقنية والرعاية الصحية.", "Skilled professionals in engineering, technology, and healthcare."],
  JO: ["متخصصون في المحاسبة والقانون والإدارة.", "Professionals in accounting, law, and administration."],
  LK: ["كوادر للضيافة والخدمات المنزلية والصناعة.", "Experienced workers in hospitality, domestic services, and industry."],
  EG: ["خبرات في الإعلام والتسويق والهندسة والتعليم.", "Talent across media, marketing, engineering, and education."],
  PH: ["كوادر مميزة للرعاية الصحية والخدمات والتقنية.", "Experienced workers in healthcare, services, and technology."],
  BD: ["كوادر متخصصة في الإنشاءات والصناعة والخدمات.", "Specialists in construction, industry, and services."],
  UG: ["كوادر في الزراعة والخدمات والإنشاءات.", "Talent across agriculture, services, and construction."],
  NP: ["كوادر ماهرة في الإنشاءات والأمن والصناعة.", "Skilled workers in construction, security, and industry."],
  SD: ["خبرات في الرعاية الصحية والهندسة والتعليم والإدارة.", "Professionals in healthcare, engineering, education, and administration."],
};

export async function ensureDefaultCountries(): Promise<void> {
  for (const [index, catalogCountry] of countryCatalog.slice(0, 10).entries()) {
    const [descriptionAr, descriptionEn] = defaultDescriptions[catalogCountry.code] || [
      `كوادر وخبرات من ${catalogCountry.nameAr}.`,
      `Talent and expertise from ${catalogCountry.nameEn}.`,
    ];
    await CountryModel.updateOne(
      { code: catalogCountry.code },
      {
        $setOnInsert: {
          ...catalogCountry,
          descriptionAr,
          descriptionEn,
          order: index + 1,
          isPublished: true,
        },
      },
      { upsert: true },
    );
  }
}

export function catalogCountry(code: string) {
  return findCountryCatalogEntry(code.toUpperCase());
}