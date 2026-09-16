import { useMemo, useState } from "react";
import { geoCentroid } from "d3-geo";
import { ComposableMap, Geography, Geographies, Line, Marker } from "react-simple-maps";
import { Link } from "react-router-dom";
import type { Country } from "../types";
import worldAtlas from "world-atlas/countries-110m.json";

type InteractiveWorldMapProps = {
  countries: Country[];
  countryName: (country: Country) => string;
  requestLabel: string;
};

type CountryDetailsProps = {
  country: Country | null;
  countryName: (country: Country) => string;
  requestLabel: string;
};

const NUMERIC_COUNTRY_IDS: Record<string, string> = {
  SA: "682",
  PK: "586",
  IN: "356",
  JO: "400",
  LK: "144",
  EG: "818",
  PH: "608",
  BD: "050",
  UG: "800",
  NP: "524",
  SD: "729",
  AE: "784",
  QA: "634",
  KW: "414",
  OM: "512",
  TR: "792",
  MA: "504",
  TN: "788",
  DZ: "012",
  ET: "231",
  KE: "404",
  TZ: "834",
  GH: "288",
  NG: "566",
  ZA: "710",
  GB: "826",
  DE: "276",
  FR: "250",
  US: "840",
  CA: "124",
  BR: "076",
  AU: "036",
  MY: "458",
  ID: "360",
  CN: "156",
  JP: "392",
};

function normalizeCountryName(value: unknown) {
  return String(value || "")
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/\./g, "")
    .trim();
}

function CountryDetails({ country, countryName, requestLabel }: CountryDetailsProps) {
  if (!country) {
    return (
      <aside className="rounded-3xl border border-[#D9D2C5] bg-[#EDE7DC] p-6 text-right">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#1F6B55]">Recruitment route</p>
        <h3 className="mt-3 text-xl font-black text-[#17251F]">اختر دولة من الخريطة</h3>
        <p className="mt-3 text-sm leading-7 text-[#68716B]">
          اضغط على أي دولة مفعّلة لمعرفة حالة الاستقطاب والانتقال إلى الطلب الخاص بها.
        </p>
      </aside>
    );
  }

  return (
    <aside className="rounded-3xl border border-[#D9D2C5] bg-[#EDE7DC] p-6 text-right">
      <div className="flex items-center justify-between gap-3 border-b border-[#D9D2C5] pb-5">
        <span className="text-3xl" aria-hidden="true">{country.flag}</span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#1F6B55]">Selected country</p>
          <h3 className="mt-1 text-xl font-black text-[#17251F]">{countryName(country)}</h3>
          <p className="text-sm text-[#68716B]">{country.nameAr} · {country.nameEn}</p>
        </div>
      </div>
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-[#68716B]">حالة الاستقطاب</dt>
          <dd className="font-bold text-[#1F6B55]">متاح</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-[#68716B]">الترتيب</dt>
          <dd className="font-bold text-[#17251F]">#{country.order}</dd>
        </div>
      </dl>
      <Link
        to={`/client/register?country=${encodeURIComponent(country.code)}`}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1F6B55] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#17251F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F6B55] focus-visible:ring-offset-2"
      >
        {requestLabel}
        <span aria-hidden="true">←</span>
      </Link>
    </aside>
  );
}

export default function InteractiveWorldMap({
  countries,
  countryName,
  requestLabel,
}: InteractiveWorldMapProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null);
  const countryByMapId = useMemo(
    () => new Map(
      countries
        .filter((country) => NUMERIC_COUNTRY_IDS[country.code])
        .map((country) => [NUMERIC_COUNTRY_IDS[country.code], country]),
    ),
    [countries],
  );
  const countryByName = useMemo(
    () => new Map(countries.map((country) => [normalizeCountryName(country.nameEn), country])),
    [countries],
  );
  const getCountryForGeography = (geography: { id?: string | number; properties?: { name?: string } }) =>
    countryByMapId.get(String(geography.id)) || countryByName.get(normalizeCountryName(geography.properties?.name));

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_290px]">
      <div className="rounded-3xl border border-[#D9D2C5] bg-[#EDE7DC] p-3 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D9D2C5] px-2 pb-4">
          <div className="relative min-h-6 text-xs text-[#68716B]" role="status" aria-live="polite">
            {hoveredCountry ? (
              <span role="tooltip">
                {hoveredCountry.nameAr} · {hoveredCountry.nameEn}
              </span>
            ) : (
              <span>الدول المفعّلة تظهر باللون الأخضر</span>
            )}
          </div>
          <div className="text-right">
            <span className="block text-2xl font-black text-[#17251F]">{countries.length}</span>
            <span className="text-xs text-[#68716B]">دول الاستقطاب</span>
          </div>
        </div>

        <div className="relative mt-3 overflow-hidden rounded-2xl bg-[#E5DED2]">
          <ComposableMap
            projection="geoEqualEarth"
            projectionConfig={{ scale: 150, center: [10, 5] }}
            width={800}
            height={430}
            className="h-auto w-full"
            aria-label="Interactive world map of recruitment countries"
          >
            <Geographies geography={worldAtlas}>
              {({ geographies }) => {
                const geographyByCountry = new Map(
                  geographies
                    .map((geography) => [getCountryForGeography(geography), geography] as const)
                    .filter(([country]) => Boolean(country)),
                );
                const saudiGeography = geographyByCountry.get(countries.find((country) => country.code === "SA"));
                const saudiCoordinates = saudiGeography
                  ? (geoCentroid(saudiGeography as any) as [number, number])
                  : [45, 24];

                return (
                  <>
                    <g aria-hidden="true" className="pointer-events-none">
                      {geographies.map((geography) => {
                        const country = getCountryForGeography(geography);
                        if (!country || country.code === "SA") return null;
                        return (
                          <Line
                            key={`route-${geography.rsmKey}`}
                            from={saudiCoordinates}
                            to={geoCentroid(geography as any) as [number, number]}
                            stroke="#1F6B55"
                            strokeOpacity={country.isPublished ? 0.2 : 0}
                            strokeWidth={0.7}
                          />
                        );
                      })}
                    </g>

                    {geographies.map((geography) => {
                      const country = getCountryForGeography(geography);
                      const isActive = Boolean(country?.isPublished);
                      const isSelected = Boolean(country && selectedCountry && country._id === selectedCountry._id);
                      const isHovered = Boolean(country && hoveredCountry && country._id === hoveredCountry._id);
                      const fillColor = isSelected
                        ? "#173E31"
                        : isHovered && isActive
                          ? "#2B7C64"
                          : isActive
                            ? "#1F6B55"
                            : "#C8C1B6";
                      const strokeColor = isHovered && isActive ? "#1F6B55" : "#F4F0E8";

                      return (
                        <Geography
                          key={geography.rsmKey}
                          geography={geography}
                          tabIndex={isActive ? 0 : -1}
                          aria-label={country ? `${country.nameAr} · ${country.nameEn}` : String(geography.properties?.name || "Country")}
                          onMouseEnter={() => country && setHoveredCountry(country)}
                          onMouseLeave={() => setHoveredCountry(null)}
                          onFocus={() => country && setHoveredCountry(country)}
                          onBlur={() => setHoveredCountry(null)}
                          onClick={() => {
                            if (country && isActive) setSelectedCountry(country);
                          }}
                          fill={fillColor}
                          stroke={strokeColor}
                          strokeWidth={isHovered && isActive ? 1.2 : 0.7}
                          style={{ cursor: isActive ? "pointer" : "default", fill: fillColor, outline: "none", stroke: strokeColor }}
                        />
                      );
                    })}

                    <g aria-hidden="true" className="pointer-events-none">
                      {geographies.map((geography) => {
                        const country = getCountryForGeography(geography);
                        if (!country || !country.isPublished) return null;
                        return (
                          <Marker key={`flag-${geography.rsmKey}`} coordinates={geoCentroid(geography as any) as [number, number]}>
                            <text
                              textAnchor="middle"
                              y="5"
                              fontSize="15"
                              style={{ fontFamily: "Apple Color Emoji, Segoe UI Emoji, sans-serif" }}
                            >
                              {country.flag}
                            </text>
                          </Marker>
                        );
                      })}
                    </g>
                  </>
                );
              }}
            </Geographies>
          </ComposableMap>
        </div>
      </div>

      <CountryDetails country={selectedCountry} countryName={countryName} requestLabel={requestLabel} />
    </div>
  );
}