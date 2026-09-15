export type CountryCatalogEntry = {
  code: string;
  nameAr: string;
  nameEn: string;
  flag: string;
  mapX: number;
  mapY: number;
};

// Coordinates are intentionally normalized to the public map viewBox.
// They describe the country label position, not a GIS boundary.
export const countryCatalog: CountryCatalogEntry[] = [
  { code: "PK", nameAr: "باكستان", nameEn: "Pakistan", flag: "🇵🇰", mapX: 682, mapY: 267 },
  { code: "IN", nameAr: "الهند", nameEn: "India", flag: "🇮🇳", mapX: 709, mapY: 293 },
  { code: "JO", nameAr: "الأردن", nameEn: "Jordan", flag: "🇯🇴", mapX: 589, mapY: 250 },
  { code: "LK", nameAr: "سريلانكا", nameEn: "Sri Lanka", flag: "🇱🇰", mapX: 718, mapY: 349 },
  { code: "EG", nameAr: "مصر", nameEn: "Egypt", flag: "🇪🇬", mapX: 550, mapY: 273 },
  { code: "PH", nameAr: "الفلبين", nameEn: "Philippines", flag: "🇵🇭", mapX: 816, mapY: 323 },
  { code: "BD", nameAr: "بنغلاديش", nameEn: "Bangladesh", flag: "🇧🇩", mapX: 735, mapY: 281 },
  { code: "UG", nameAr: "أوغندا", nameEn: "Uganda", flag: "🇺🇬", mapX: 572, mapY: 349 },
  { code: "NP", nameAr: "نيبال", nameEn: "Nepal", flag: "🇳🇵", mapX: 724, mapY: 253 },
  { code: "SD", nameAr: "السودان", nameEn: "Sudan", flag: "🇸🇩", mapX: 558, mapY: 322 },
  { code: "SA", nameAr: "السعودية", nameEn: "Saudi Arabia", flag: "🇸🇦", mapX: 615, mapY: 290 },
  { code: "AE", nameAr: "الإمارات", nameEn: "United Arab Emirates", flag: "🇦🇪", mapX: 646, mapY: 302 },
  { code: "QA", nameAr: "قطر", nameEn: "Qatar", flag: "🇶🇦", mapX: 637, mapY: 285 },
  { code: "KW", nameAr: "الكويت", nameEn: "Kuwait", flag: "🇰🇼", mapX: 625, mapY: 268 },
  { code: "OM", nameAr: "عُمان", nameEn: "Oman", flag: "🇴🇲", mapX: 665, mapY: 321 },
  { code: "TR", nameAr: "تركيا", nameEn: "Turkey", flag: "🇹🇷", mapX: 600, mapY: 220 },
  { code: "MA", nameAr: "المغرب", nameEn: "Morocco", flag: "🇲🇦", mapX: 470, mapY: 255 },
  { code: "TN", nameAr: "تونس", nameEn: "Tunisia", flag: "🇹🇳", mapX: 505, mapY: 235 },
  { code: "DZ", nameAr: "الجزائر", nameEn: "Algeria", flag: "🇩🇿", mapX: 480, mapY: 285 },
  { code: "ET", nameAr: "إثيوبيا", nameEn: "Ethiopia", flag: "🇪🇹", mapX: 595, mapY: 374 },
  { code: "KE", nameAr: "كينيا", nameEn: "Kenya", flag: "🇰🇪", mapX: 595, mapY: 407 },
  { code: "TZ", nameAr: "تنزانيا", nameEn: "Tanzania", flag: "🇹🇿", mapX: 570, mapY: 430 },
  { code: "GH", nameAr: "غانا", nameEn: "Ghana", flag: "🇬🇭", mapX: 470, mapY: 395 },
  { code: "NG", nameAr: "نيجيريا", nameEn: "Nigeria", flag: "🇳🇬", mapX: 455, mapY: 355 },
  { code: "ZA", nameAr: "جنوب أفريقيا", nameEn: "South Africa", flag: "🇿🇦", mapX: 515, mapY: 465 },
  { code: "GB", nameAr: "المملكة المتحدة", nameEn: "United Kingdom", flag: "🇬🇧", mapX: 470, mapY: 170 },
  { code: "DE", nameAr: "ألمانيا", nameEn: "Germany", flag: "🇩🇪", mapX: 520, mapY: 175 },
  { code: "FR", nameAr: "فرنسا", nameEn: "France", flag: "🇫🇷", mapX: 498, mapY: 205 },
  { code: "US", nameAr: "الولايات المتحدة", nameEn: "United States", flag: "🇺🇸", mapX: 225, mapY: 260 },
  { code: "CA", nameAr: "كندا", nameEn: "Canada", flag: "🇨🇦", mapX: 230, mapY: 175 },
  { code: "BR", nameAr: "البرازيل", nameEn: "Brazil", flag: "🇧🇷", mapX: 330, mapY: 390 },
  { code: "AU", nameAr: "أستراليا", nameEn: "Australia", flag: "🇦🇺", mapX: 845, mapY: 440 },
  { code: "MY", nameAr: "ماليزيا", nameEn: "Malaysia", flag: "🇲🇾", mapX: 770, mapY: 373 },
  { code: "ID", nameAr: "إندونيسيا", nameEn: "Indonesia", flag: "🇮🇩", mapX: 790, mapY: 410 },
  { code: "CN", nameAr: "الصين", nameEn: "China", flag: "🇨🇳", mapX: 780, mapY: 230 },
  { code: "JP", nameAr: "اليابان", nameEn: "Japan", flag: "🇯🇵", mapX: 875, mapY: 242 },
];

export function findCountryCatalogEntry(code: string): CountryCatalogEntry | undefined {
  return countryCatalog.find((country) => country.code === code);
}