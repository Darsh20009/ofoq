import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { geoCentroid } from "d3-geo";
import { ComposableMap, Geography, Geographies, Marker } from "react-simple-maps";
import { Link } from "react-router-dom";
import type { Country } from "../types";
import worldAtlas from "world-atlas/countries-110m.json";

type InteractiveWorldMapProps = {
  countries: Country[];
  countryName: (country: Country) => string;
  requestLabel: string;
  isArabic: boolean;
};

type CountryDetailsProps = {
  country: Country | null;
  countryName: (country: Country) => string;
  requestLabel: string;
  isArabic: boolean;
  reducedMotion: boolean;
};

type GeographyLike = {
  id?: string | number;
  properties?: { name?: string };
  rsmKey?: string;
};

const ROTATION_INTERVAL = 4400;

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

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener?.("change", update);
    return () => mediaQuery.removeEventListener?.("change", update);
  }, []);

  return reducedMotion;
}

function CountryDetails({
  country,
  countryName,
  requestLabel,
  isArabic,
  reducedMotion,
}: CountryDetailsProps) {
  const displayName = country ? countryName(country) : "";
  const message = country
    ? isArabic
      ? `نستقطب في ${displayName}`
      : `Recruiting in ${displayName}`
    : "";
  const [typedMessage, setTypedMessage] = useState("");

  useEffect(() => {
    if (!message) {
      setTypedMessage("");
      return;
    }

    if (reducedMotion) {
      setTypedMessage(message);
      return;
    }

    let characterIndex = 0;
    setTypedMessage("");
    const timer = window.setInterval(() => {
      characterIndex += 1;
      setTypedMessage(message.slice(0, characterIndex));
      if (characterIndex >= message.length) window.clearInterval(timer);
    }, 55);

    return () => window.clearInterval(timer);
  }, [message, reducedMotion]);

  const isTypingComplete = Boolean(message) && typedMessage === message;

  if (!country) {
    return (
      <aside className="rounded-3xl border border-[#D9D2C5] bg-[#EDE7DC] p-6 text-right">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#1F6B55]">Recruitment route</p>
        <h3 className="mt-3 text-xl font-black text-[#17251F]">
          {isArabic ? "اختر دولة من الخريطة" : "Choose a country from the map"}
        </h3>
        <p className="mt-3 text-sm leading-7 text-[#68716B]">
          {isArabic
            ? "اضغط على أي دولة مفعّلة لمعرفة حالة الاستقطاب والانتقال إلى الطلب الخاص بها."
            : "Select an active country to view its recruitment status and application route."}
        </p>
      </aside>
    );
  }

  return (
    <aside className="rounded-3xl border border-[#D9D2C5] bg-[#EDE7DC] p-6 text-right" aria-live="polite">
      <div className="flex items-center justify-between gap-3 border-b border-[#D9D2C5] pb-5">
        <span className="text-4xl" aria-hidden="true">{country.flag}</span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#1F6B55]">Recruitment route</p>
          <h3 className="mt-1 text-2xl font-black text-[#17251F]">{displayName}</h3>
          <p className="text-sm text-[#68716B]">{country.nameAr} · {country.nameEn}</p>
        </div>
      </div>

      <div className="mt-5 min-h-[92px]">
        <p className="text-xs text-[#68716B]">حالة الاستقطاب</p>
        <p className="mt-2 text-xl font-black text-[#17251F] transition-opacity duration-500">
          {typedMessage}
          {!reducedMotion && typedMessage && typedMessage !== message ? (
            <span className="mr-1 inline-block h-5 w-px translate-y-1 bg-[#1F6B55]" aria-hidden="true" />
          ) : null}
        </p>
        <p className="mt-2 text-sm text-[#68716B]">
          {isArabic ? "الطلب مفتوح من هذه الدولة." : "Applications are open from this country."}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-[#D9D2C5] pt-4 text-sm">
        <span className="text-[#68716B]">الترتيب</span>
        <span className="font-bold text-[#17251F]">#{country.order}</span>
      </div>

      <Link
        to={`/client/register?country=${encodeURIComponent(country.code)}`}
        className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1F6B55] px-4 py-3 text-sm font-bold text-white transition-all duration-500 hover:bg-[#17251F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F6B55] focus-visible:ring-offset-2 ${
          isTypingComplete || reducedMotion ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"
        }`}
        tabIndex={isTypingComplete || reducedMotion ? 0 : -1}
      >
        {requestLabel}
        <span aria-hidden="true">←</span>
      </Link>
    </aside>
  );
}

function isActivationKey(event: KeyboardEvent<SVGGElement>) {
  return event.key === "Enter" || event.key === " ";
}

export default function InteractiveWorldMap({
  countries,
  countryName,
  requestLabel,
  isArabic,
}: InteractiveWorldMapProps) {
  const reducedMotion = useReducedMotion();
  const [activeCountry, setActiveCountry] = useState<Country | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null);

  const countryKey = countries.map((country) => country._id).join("|");
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
  const getCountryForGeography = (geography: GeographyLike) =>
    countryByMapId.get(String(geography.id)) || countryByName.get(normalizeCountryName(geography.properties?.name));

  useEffect(() => {
    if (!countries.length || activeCountry) return;

    const start = () => {
      setActiveIndex(0);
      setActiveCountry(countries[0]);
    };
    if (reducedMotion) {
      start();
      return;
    }

    const timer = window.setTimeout(start, 900);
    return () => window.clearTimeout(timer);
  }, [activeCountry, countryKey, countries, reducedMotion]);

  useEffect(() => {
    if (!isAutoPlaying || reducedMotion || countries.length < 2 || activeIndex < 0) return;

    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => {
        const nextIndex = (currentIndex + 1) % countries.length;
        setActiveCountry(countries[nextIndex]);
        return nextIndex;
      });
    }, ROTATION_INTERVAL);

    return () => window.clearInterval(timer);
  }, [activeIndex, countries, isAutoPlaying, reducedMotion]);

  const selectCountry = (country: Country) => {
    const nextIndex = countries.findIndex((item) => item._id === country._id);
    setActiveCountry(country);
    setActiveIndex(nextIndex);
    setIsAutoPlaying(false);
  };

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_290px]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-4 px-1 pb-4">
          <div className="relative min-h-6 text-xs text-[#68716B]" role="status" aria-live="polite">
            {hoveredCountry ? (
              <span role="tooltip">
                {hoveredCountry.nameAr} · {hoveredCountry.nameEn}
              </span>
            ) : (
              <span>{isArabic ? "الدول المفعّلة تظهر باللون الأخضر" : "Active recruitment countries appear in green"}</span>
            )}
          </div>
          <div className="text-right">
            <span className="block text-2xl font-black text-[#17251F]">{countries.length}</span>
            <span className="text-xs text-[#68716B]">دول الاستقطاب</span>
          </div>
        </div>

        <div className="relative mt-1 overflow-visible">
          <ComposableMap
            projection="geoEqualEarth"
            projectionConfig={{ scale: 150, center: [10, 5] }}
            width={800}
            height={430}
            className="h-auto w-full"
            aria-label="Interactive world map of recruitment countries"
          >
            <Geographies geography={worldAtlas}>
              {({ geographies }) => (
                <>
                  {geographies.map((geography) => {
                    const country = getCountryForGeography(geography);
                    const isActive = Boolean(country?.isPublished);
                    const isSpotlight = Boolean(
                      country && activeCountry && country._id === activeCountry._id,
                    );
                    const isHovered = Boolean(
                      country && hoveredCountry && country._id === hoveredCountry._id,
                    );
                    const fillColor = isSpotlight
                      ? "#173E31"
                      : isActive
                        ? "#1F6B55"
                        : "#D8D1C5";
                    const strokeColor = isSpotlight || isHovered ? "#1F6B55" : "#F4F0E8";

                    return (
                      <Geography
                        key={geography.rsmKey}
                        geography={geography}
                        tabIndex={isActive ? 0 : -1}
                        aria-label={country ? `${country.nameAr} · ${country.nameEn}` : String(geography.properties?.name || "Country")}
                        className={isActive ? "focus-visible:outline-none" : ""}
                        onMouseEnter={() => country && isActive && setHoveredCountry(country)}
                        onMouseLeave={() => setHoveredCountry(null)}
                        onFocus={() => country && isActive && setHoveredCountry(country)}
                        onBlur={() => setHoveredCountry(null)}
                        onClick={() => country && isActive && selectCountry(country)}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={isSpotlight || isHovered ? 1.2 : 0.7}
                        style={{
                          cursor: isActive ? "pointer" : "default",
                          fill: fillColor,
                          outline: "none",
                          stroke: strokeColor,
                          transition: reducedMotion ? "none" : "fill 500ms ease, stroke 500ms ease",
                        }}
                      />
                    );
                  })}

                  {geographies.map((geography) => {
                    const country = getCountryForGeography(geography);
                    if (!country || !country.isPublished) return null;

                    const isSpotlight = Boolean(
                      activeCountry && country._id === activeCountry._id,
                    );
                    const flagScale = isSpotlight ? 1.3 : 1;
                    const flagLabel = `${country.nameAr} · ${country.nameEn}`;

                    return (
                      <Marker key={`flag-${geography.rsmKey}`} coordinates={geoCentroid(geography as any) as [number, number]}>
                        <g
                          role="button"
                          tabIndex={0}
                          aria-label={flagLabel}
                          onClick={() => selectCountry(country)}
                          onKeyDown={(event) => {
                            if (isActivationKey(event)) {
                              event.preventDefault();
                              selectCountry(country);
                            }
                          }}
                          onMouseEnter={() => setHoveredCountry(country)}
                          onMouseLeave={() => setHoveredCountry(null)}
                          onFocus={() => setHoveredCountry(country)}
                          onBlur={() => setHoveredCountry(null)}
                          transform={`translate(0 ${isSpotlight ? -8 : -3}) scale(${flagScale})`}
                          style={{
                            cursor: "pointer",
                            outline: "none",
                            transition: reducedMotion ? "none" : "transform 600ms cubic-bezier(.22,.61,.36,1)",
                          }}
                        >
                          <line
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="-16"
                            stroke="#1F6B55"
                            strokeOpacity={isSpotlight ? 0.55 : 0.25}
                            strokeWidth="0.7"
                          />
                          <rect
                            x="-26"
                            y="-29"
                            width="52"
                            height="42"
                            rx="8"
                            fill="#F4F0E8"
                            fillOpacity={isSpotlight ? 1 : 0.92}
                            stroke={isSpotlight || hoveredCountry?._id === country._id ? "#173E31" : "#B6B0A5"}
                            strokeWidth={isSpotlight || hoveredCountry?._id === country._id ? 1.4 : 0.8}
                          />
                          <text
                            textAnchor="middle"
                            y="2"
                            fontSize="28"
                            style={{ fontFamily: "Apple Color Emoji, Segoe UI Emoji, sans-serif" }}
                          >
                            {country.flag}
                          </text>
                          {isSpotlight ? (
                            <>
                              <text
                                textAnchor="middle"
                                y="31"
                                fontSize="10"
                                fontWeight="700"
                                fill="#173E31"
                                style={{ fontFamily: "inherit" }}
                              >
                                {country.nameAr}
                              </text>
                              <text
                                textAnchor="middle"
                                y="42"
                                fontSize="7"
                                fill="#68716B"
                                style={{ fontFamily: "inherit" }}
                              >
                                {country.nameEn}
                              </text>
                            </>
                          ) : null}
                        </g>
                      </Marker>
                    );
                  })}
                </>
              )}
            </Geographies>
          </ComposableMap>
        </div>
      </div>

      <CountryDetails
        country={activeCountry}
        countryName={countryName}
        requestLabel={requestLabel}
        isArabic={isArabic}
        reducedMotion={reducedMotion}
      />
    </div>
  );
}