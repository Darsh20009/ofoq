import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { geoCentroid, geoDistance, geoGraticule10, geoOrthographic, geoPath, geoRotation } from "d3-geo";
import { feature } from "topojson-client";
import { Link } from "react-router-dom";
import type { Country } from "../types";
import worldAtlas from "world-atlas/countries-110m.json";
import "./InteractiveWorldMap.css";

type InteractiveWorldMapProps = {
  countries: Country[];
  countryName: (country: Country) => string;
  requestLabel: string;
  isArabic: boolean;
};

type GlobeView = { rotation: [number, number, number]; zoom: number };
type GlobeFeature = {
  id?: string | number;
  properties?: { name?: string };
  geometry: any;
  key: string;
};

const COUNTRY_NUMERIC_IDS: Record<string, string> = {
  AD:"020",AE:"784",AF:"004",AG:"028",AI:"660",AL:"008",AM:"051",AO:"024",AQ:"010",AR:"032",AS:"016",AT:"040",AU:"036",AW:"533",AX:"248",AZ:"031",
  BA:"070",BB:"052",BD:"050",BE:"056",BF:"854",BG:"100",BH:"048",BI:"108",BJ:"204",BL:"652",BM:"060",BN:"096",BO:"068",BQ:"535",BR:"076",BS:"044",BT:"064",BV:"074",BW:"072",BY:"112",BZ:"084",
  CA:"124",CC:"166",CD:"180",CF:"140",CG:"178",CH:"756",CI:"384",CK:"184",CL:"152",CM:"120",CN:"156",CO:"170",CR:"188",CU:"192",CV:"132",CW:"531",CX:"162",CY:"196",CZ:"203",
  DE:"276",DJ:"262",DK:"208",DM:"212",DO:"214",DZ:"012",
  EC:"218",EE:"233",EG:"818",EH:"732",ER:"232",ES:"724",ET:"231",
  FI:"246",FJ:"242",FK:"238",FM:"583",FO:"234",FR:"250",
  GA:"266",GB:"826",GD:"308",GE:"268",GF:"254",GG:"831",GH:"288",GI:"292",GL:"304",GM:"270",GN:"324",GP:"312",GQ:"226",GR:"300",GS:"239",GT:"320",GU:"316",GW:"624",GY:"328",
  HK:"344",HM:"334",HN:"340",HR:"191",HT:"332",HU:"348",
  ID:"360",IE:"372",IL:"376",IM:"833",IN:"356",IO:"086",IQ:"368",IR:"364",IS:"352",IT:"380",
  JE:"832",JM:"388",JO:"400",JP:"392",
  KE:"404",KG:"417",KH:"116",KI:"296",KM:"174",KN:"659",KP:"408",KR:"410",KW:"414",KY:"136",KZ:"398",
  LA:"418",LB:"422",LC:"662",LI:"438",LK:"144",LR:"430",LS:"426",LT:"440",LU:"442",LV:"428",LY:"434",
  MA:"504",MC:"492",MD:"498",ME:"499",MF:"663",MG:"450",MH:"584",MK:"807",ML:"466",MM:"104",MN:"496",MO:"446",MP:"580",MQ:"474",MR:"478",MS:"500",MT:"470",MU:"480",MV:"462",MW:"454",MX:"484",MY:"458",MZ:"508",
  NA:"516",NC:"540",NE:"562",NF:"574",NG:"566",NI:"558",NL:"528",NO:"578",NP:"524",NR:"520",NU:"570",NZ:"554",
  OM:"512",
  PA:"591",PE:"604",PF:"258",PG:"598",PH:"608",PK:"586",PL:"616",PM:"666",PN:"612",PR:"630",PS:"275",PT:"620",PW:"585",PY:"600",
  QA:"634",
  RE:"638",RO:"642",RS:"688",RU:"643",RW:"646",
  SA:"682",SB:"090",SC:"690",SD:"729",SE:"752",SG:"702",SH:"654",SI:"705",SJ:"744",SK:"703",SL:"694",SM:"674",SN:"686",SO:"706",SR:"740",SS:"728",ST:"678",SV:"222",SX:"534",SY:"760",SZ:"748",
  TC:"796",TD:"148",TF:"260",TG:"768",TH:"764",TJ:"762",TK:"772",TL:"626",TM:"795",TN:"788",TO:"776",TR:"792",TT:"780",TV:"798",TW:"158",TZ:"834",
  UA:"804",UG:"800",UM:"581",US:"840",UY:"858",UZ:"860",
  VA:"336",VC:"670",VE:"862",VG:"092",VI:"850",VN:"704",VU:"548",
  WF:"876",WS:"882",
  YE:"887",YT:"175",
  ZA:"710",ZM:"894",ZW:"716",
};

const NAME_ALIASES: Record<string, string> = {
  "united states of america": "united states",
  "united states": "united states",
  "united kingdom": "united kingdom",
  "south korea": "south korea",
  "republic of korea": "south korea",
  "north korea": "north korea",
  "democratic republic of the congo": "democratic republic of the congo",
  "dr congo": "democratic republic of the congo",
  "republic of the congo": "republic of the congo",
  "ivory coast": "côte d’ivoire",
  "cote d ivoire": "côte d’ivoire",
  "russia": "russia",
  "russian federation": "russia",
  "iran": "iran",
  "iran islamic republic of": "iran",
  "syria": "syria",
  "syrian arab republic": "syria",
  "laos": "laos",
  "lao peoples democratic republic": "laos",
  "vietnam": "vietnam",
  "viet nam": "vietnam",
  "tanzania": "united republic of tanzania",
  "united republic of tanzania": "united republic of tanzania",
  "bolivia": "bolivia",
  "venezuela": "venezuela",
  "moldova": "moldova",
  "brunei": "brunei",
  "cape verde": "cabo verde",
  "eswatini": "swaziland",
  "north macedonia": "macedonia",
  "czechia": "czech republic",
  "east timor": "timor-leste",
  "palestine": "palestine",
  "turkiye": "turkey",
  "Türkiye": "turkey",
};

const START_VIEW: GlobeView = { rotation: [12, -6, 0], zoom: 1 };
const GLOBE_CENTER: [number, number] = [400, 282];
const GLOBE_RADIUS = 232;
const TOUR_DWELL_MS = 5_000;
const FOCUS_TRANSITION_MS = 850;
const SMALL_COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  AD: [1.6, 42.5], AG: [-61.8, 17.1], AI: [-63.05, 18.22], AX: [20, 60.2], AW: [-69.97, 12.52],
  BB: [-59.55, 13.2], BH: [50.55, 26.05], BM: [-64.75, 32.3], BN: [114.7, 4.5], BQ: [-68.3, 12.2],
  BS: [-77.4, 25], BT: [90.4, 27.5], CW: [-69, 12.15], CY: [33.4, 35.1], DM: [-61.35, 15.4],
  FO: [-6.9, 61.9], GD: [-61.7, 12.1], GG: [-2.58, 49.46], GI: [-5.35, 36.14], GU: [144.8, 13.4],
  HK: [114.17, 22.3], IM: [-4.55, 54.25], JE: [-2.1, 49.2], KI: [173, 1.4], KN: [-62.7, 17.3],
  KY: [-81.25, 19.3], LI: [9.55, 47.17], MC: [7.42, 43.73], MF: [-63.05, 18.08], MH: [171.2, 7.1],
  MO: [113.54, 22.2], MV: [73.5, 4.2], MT: [14.4, 35.9], MU: [57.55, -20.2], NR: [166.93, -0.52],
  NU: [-169.9, -19.05], PW: [134.5, 7.5], SG: [103.8, 1.35], SM: [12.45, 43.94], SX: [-63.05, 18.04],
  TC: [-71.8, 21.8], TK: [-171.85, -9.2], TO: [-175.2, -21.2], TV: [179.2, -8.5], VA: [12.45, 41.9],
  VC: [-61.2, 13.25], VG: [-64.6, 18.4], VI: [-64.9, 18.3], WF: [-176.2, -13.3], WS: [-172.1, -13.8],
  XK: [20.9, 42.6],
};

function normalizeName(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

function normalizeLongitude(longitude: number) {
  return ((longitude + 180) % 360 + 360) % 360 - 180;
}

function GlobeControlIcon({ kind }: { kind: "pause" | "play" | "reset" }) {
  if (kind === "pause") return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6.5 4.5v11m7-11v11" /></svg>;
  if (kind === "play") return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4.7 8 5.3-8 5.3z" /></svg>;
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.2 7.2A6.3 6.3 0 1 1 4 12m.2-7v2.5H7" /></svg>;
}

export default function InteractiveWorldMap({
  countries,
  countryName,
  requestLabel,
  isArabic,
}: InteractiveWorldMapProps) {
  const reducedMotion = useReducedMotion();
  const [view, setView] = useState<GlobeView>(START_VIEW);
  const [activeCountry, setActiveCountry] = useState<Country | null>(null);
  const [isPlaying, setIsPlaying] = useState(!reducedMotion);
  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const networkRef = useRef<HTMLDivElement>(null);
  const countryStripRef = useRef<HTMLDivElement>(null);
  const countryChipRefs = useRef(new Map<string, HTMLButtonElement>());
  const dragRef = useRef<{ pointerId: number; x: number; y: number; moved: boolean } | null>(null);
  const skipNextClickRef = useRef(false);
  const animationRef = useRef<number | null>(null);
  const tourTimerRef = useRef<number | null>(null);
  const viewRef = useRef(view);
  const [isOnscreen, setIsOnscreen] = useState(true);
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === "undefined" || document.visibilityState === "visible",
  );
  viewRef.current = view;

  const recruitmentCountries = useMemo(
    () => countries.filter((country) => country.isPublished).slice().sort((a, b) => a.order - b.order),
    [countries],
  );
  const recruitmentCountryIds = useMemo(
    () => recruitmentCountries.map((country) => country._id).join("|"),
    [recruitmentCountries],
  );

  const countryFeatures = useMemo(() => {
    const topology = worldAtlas as unknown as { objects: { countries: unknown } };
    const collection = feature(worldAtlas as never, topology.objects.countries as never) as unknown as {
      features: GlobeFeature[];
    };
    return collection.features.map((item, index) => ({ ...item, key: `${item.id ?? "country"}-${index}` }));
  }, []);

  const geographyIndexes = useMemo(() => {
    const byNumericId = new Map<string, GlobeFeature>();
    const byName = new Map<string, GlobeFeature>();
    for (const geography of countryFeatures) {
      if (geography.id !== undefined) byNumericId.set(String(geography.id).padStart(3, "0"), geography);
      if (geography.properties?.name) byName.set(normalizeName(geography.properties.name), geography);
    }
    return { byNumericId, byName };
  }, [countryFeatures]);

  const matchCountryFeature = useCallback((country: Country) => {
    const numericId = COUNTRY_NUMERIC_IDS[country.code.toUpperCase()];
    if (numericId) {
      const byId = geographyIndexes.byNumericId.get(numericId);
      if (byId) return byId;
    }
    const aliases = [country.nameEn, country.nameAr];
    for (const alias of aliases) {
      const normalized = normalizeName(alias);
      const canonical = normalizeName(NAME_ALIASES[normalized] ?? normalized);
      const match = geographyIndexes.byName.get(canonical) ?? geographyIndexes.byName.get(normalized);
      if (match) return match;
    }
    return undefined;
  }, [geographyIndexes]);

  const featureCountries = useMemo(() => {
    const byFeatureKey = new Map<string, Country>();
    const featureByCountryId = new Map<string, GlobeFeature>();
    const coordinatesByCountryId = new Map<string, [number, number]>();
    recruitmentCountries.forEach((country) => {
      const geography = matchCountryFeature(country);
      if (geography) {
        byFeatureKey.set(geography.key, country);
        featureByCountryId.set(country._id, geography);
        coordinatesByCountryId.set(country._id, geoCentroid(geography as never) as [number, number]);
      } else {
        const fallbackCoordinates = SMALL_COUNTRY_CENTROIDS[country.code.toUpperCase()];
        if (fallbackCoordinates) coordinatesByCountryId.set(country._id, fallbackCoordinates);
      }
    });
    return { byFeatureKey, featureByCountryId, coordinatesByCountryId };
  }, [matchCountryFeature, recruitmentCountries]);

  useEffect(() => {
    if (!activeCountry) return;
    const latestCountry = recruitmentCountries.find((country) => country._id === activeCountry._id) ?? null;
    if (latestCountry !== activeCountry) setActiveCountry(latestCountry);
  }, [activeCountry, recruitmentCountries]);

  const projection = useMemo(
    () => geoOrthographic().translate(GLOBE_CENTER).scale(GLOBE_RADIUS * view.zoom).rotate(view.rotation).clipAngle(90),
    [view.rotation, view.zoom],
  );
  const pathGenerator = useMemo(() => geoPath(projection), [projection]);
  const graticulePath = useMemo(() => pathGenerator(geoGraticule10()), [pathGenerator]);
  const spherePath = useMemo(() => pathGenerator({ type: "Sphere" } as never), [pathGenerator]);

  useEffect(() => {
    if (reducedMotion) setIsPlaying(false);
  }, [reducedMotion]);

  useEffect(() => {
    const root = networkRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setIsOnscreen(entry.isIntersecting), {
      threshold: 0.01,
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", updateVisibility);
    updateVisibility();
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  const selectCountry = useCallback((country: Country, manual = true) => {
    const coordinates = featureCountries.coordinatesByCountryId.get(country._id);
    setActiveCountry(country);
    if (manual) setIsPlaying(false);
    const strip = countryStripRef.current;
    const chip = countryChipRefs.current.get(country._id);
    if (strip && chip) {
      const stripBounds = strip.getBoundingClientRect();
      const chipBounds = chip.getBoundingClientRect();
      if (chipBounds.left < stripBounds.left) {
        strip.scrollBy({ left: chipBounds.left - stripBounds.left, behavior: reducedMotion ? "auto" : "smooth" });
      } else if (chipBounds.right > stripBounds.right) {
        strip.scrollBy({ left: chipBounds.right - stripBounds.right, behavior: reducedMotion ? "auto" : "smooth" });
      }
    }
    if (!coordinates) return;
    const [longitude, latitude] = coordinates;
    const targetRotation: [number, number, number] = [normalizeLongitude(-longitude), Math.max(-80, Math.min(80, -latitude)), 0];
    const from = viewRef.current;
    const to: GlobeView = { rotation: targetRotation, zoom: 1.72 };
    if (reducedMotion) {
      setView(to);
      return;
    }
    if (animationRef.current !== null) window.cancelAnimationFrame(animationRef.current);
    const startedAt = performance.now();
    const duration = FOCUS_TRANSITION_MS;
    const startLongitude = from.rotation[0];
    const longitudeDelta = normalizeLongitude(targetRotation[0] - startLongitude);
    const animate = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setView({
        rotation: [
          normalizeLongitude(startLongitude + longitudeDelta * eased),
          from.rotation[1] + (targetRotation[1] - from.rotation[1]) * eased,
          0,
        ],
        zoom: from.zoom + (to.zoom - from.zoom) * eased,
      });
      if (progress < 1) animationRef.current = window.requestAnimationFrame(animate);
      else animationRef.current = null;
    };
    animationRef.current = window.requestAnimationFrame(animate);
  }, [featureCountries.coordinatesByCountryId, reducedMotion]);

  useEffect(() => {
    if (!isPlaying || reducedMotion || !recruitmentCountries.length) return;
    if (!activeCountry) {
      selectCountry(recruitmentCountries[0], false);
      return;
    }
    if (!isOnscreen || !pageVisible) return;

    tourTimerRef.current = window.setTimeout(() => {
      const currentIndex = recruitmentCountries.findIndex((country) => country._id === activeCountry._id);
      const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % recruitmentCountries.length;
      selectCountry(recruitmentCountries[nextIndex], false);
    }, TOUR_DWELL_MS + FOCUS_TRANSITION_MS);

    return () => {
      if (tourTimerRef.current !== null) window.clearTimeout(tourTimerRef.current);
      tourTimerRef.current = null;
    };
  }, [activeCountry, isOnscreen, isPlaying, pageVisible, recruitmentCountryIds, recruitmentCountries, reducedMotion, selectCountry]);

  useEffect(() => {
    if (!recruitmentCountries.length) {
      setActiveCountry(null);
      return;
    }
    if (activeCountry && !recruitmentCountries.some((country) => country._id === activeCountry._id)) {
      setActiveCountry(null);
    }
  }, [activeCountry, isPlaying, recruitmentCountries]);

  useEffect(() => () => {
    if (animationRef.current !== null) window.cancelAnimationFrame(animationRef.current);
    if (tourTimerRef.current !== null) window.clearTimeout(tourTimerRef.current);
  }, []);

  const resetGlobe = () => {
    if (animationRef.current !== null) window.cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    setActiveCountry(null);
    setHoveredCountry(null);
    setView(START_VIEW);
    setIsPlaying(!reducedMotion);
  };

  const handlePointerDown = (event: PointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) return;
    skipNextClickRef.current = false;
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
  };

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
    if (!drag.moved) return;
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (animationRef.current !== null) window.cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    setActiveCountry(null);
    setIsPlaying(false);
    const bounds = svgRef.current?.getBoundingClientRect();
    const width = bounds?.width || 800;
    setView((current) => ({
      ...current,
      rotation: [
        normalizeLongitude(current.rotation[0] + (dx / width) * 360),
        Math.max(-78, Math.min(78, current.rotation[1] - (dy / width) * 240)),
        0,
      ],
    }));
    drag.x = event.clientX;
    drag.y = event.clientY;
  };

  const endPointerDrag = (event: PointerEvent<SVGSVGElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      if (dragRef.current.moved) skipNextClickRef.current = true;
      dragRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const markerLocation = useMemo(() => {
    if (!activeCountry) return null;
    const coordinates = featureCountries.coordinatesByCountryId.get(activeCountry._id);
    if (!coordinates) return null;
    const rotated = geoRotation(view.rotation)(coordinates);
    if (geoDistance([0, 0], rotated) >= Math.PI / 2) return null;
    const projected = projection(coordinates);
    return projected ? { x: projected[0], y: projected[1] } : null;
  }, [activeCountry, featureCountries.coordinatesByCountryId, projection, view.rotation]);

  const highlightedCountry = hoveredCountry || activeCountry;
  const mapInstructions = isArabic
    ? "جولة تلقائية بين الدول بالترتيب، اختر دولة أو اسحب الكرة لإيقاف الجولة واستكشافها"
    : "An automatic tour in country order. Select a country or drag the globe to pause and explore.";

  return (
    <div ref={networkRef} className="ofoq-network" dir={isArabic ? "rtl" : "ltr"}>
      <div className="ofoq-network-main">
        <div className="ofoq-network-head">
          <div>
            <p className="ofoq-network-kicker">{isArabic ? "شبكة الاستقطاب الدولية" : "INTERNATIONAL RECRUITMENT NETWORK"}</p>
            <p className="ofoq-network-instruction">{mapInstructions}</p>
          </div>
          <div className="ofoq-network-count">
            <strong>{String(recruitmentCountries.length).padStart(2, "0")}</strong>
            <span>{isArabic ? "دولة متاحة" : "countries"}</span>
          </div>
        </div>

        <div ref={countryStripRef} className="ofoq-country-strip" role="group" aria-label={isArabic ? "دول الاستقطاب المتاحة" : "Available recruitment countries"}>
          {recruitmentCountries.length ? recruitmentCountries.map((country) => {
            const selected = activeCountry?._id === country._id;
            const label = `${country.nameAr} · ${country.nameEn}`;
            return (
              <button
                key={country._id}
                type="button"
                className={`ofoq-country-chip${selected ? " is-selected" : ""}`}
                aria-label={label}
                aria-pressed={selected}
                title={label}
                onClick={() => selectCountry(country)}
                ref={(element) => {
                  if (element) countryChipRefs.current.set(country._id, element);
                  else countryChipRefs.current.delete(country._id);
                }}
              >
                <span className="ofoq-country-flag" aria-hidden="true">{country.flag}</span>
                <span className="ofoq-country-label">{countryName(country)}</span>
              </button>
            );
          }) : (
            <div className="ofoq-network-empty">{isArabic ? "لا توجد دول استقطاب منشورة حالياً." : "No recruitment countries are currently available."}</div>
          )}
        </div>

        <div className="ofoq-globe-toolbar">
          <span className="ofoq-globe-status" role="status" aria-live="polite">
            <i className={isPlaying ? "is-live" : ""} aria-hidden="true" />
            {activeCountry
              ? `${isArabic ? activeCountry.nameAr : activeCountry.nameEn} · ${isArabic ? "تركيز الدولة" : "country focus"}${isPlaying ? ` · ${String(recruitmentCountries.findIndex((country) => country._id === activeCountry._id) + 1).padStart(2, "0")} / ${String(recruitmentCountries.length).padStart(2, "0")}` : ""}`
              : isPlaying
                ? (isArabic ? "عرض الدول بالتتابع" : "Touring countries")
                : (isArabic ? "العرض متوقف" : "Tour paused")}
          </span>
          <div className="ofoq-globe-actions">
            <button
              className="ofoq-globe-control"
              type="button"
              onClick={() => {
                if (isPlaying) {
                  setIsPlaying(false);
                } else {
                  if (!activeCountry && recruitmentCountries.length) selectCountry(recruitmentCountries[0], false);
                  setIsPlaying(true);
                }
              }}
              disabled={reducedMotion}
              aria-label={isPlaying ? (isArabic ? "إيقاف جولة الدول" : "Pause country tour") : (isArabic ? "استئناف جولة الدول" : "Resume country tour")}
              title={reducedMotion
                ? (isArabic ? "الجولة التلقائية متوقفة حسب إعداد تقليل الحركة في جهازك" : "The automatic tour is disabled by your reduced-motion preference")
                : isPlaying ? (isArabic ? "إيقاف الجولة" : "Pause tour") : (isArabic ? "استئناف الجولة" : "Resume tour")}
            >
              <GlobeControlIcon kind={isPlaying ? "pause" : "play"} />
              <span>{isPlaying ? (isArabic ? "إيقاف" : "Pause") : (isArabic ? "تشغيل" : "Play")}</span>
            </button>
            <button
              className="ofoq-globe-control"
              type="button"
              onClick={resetGlobe}
              aria-label={isArabic ? "العودة إلى الكرة الأرضية" : "Reset to globe overview"}
              title={isArabic ? "العودة إلى الكرة" : "Reset globe"}
            >
              <GlobeControlIcon kind="reset" />
              <span>{isArabic ? "العودة للكرة" : "Reset globe"}</span>
            </button>
          </div>
        </div>

        <div className="ofoq-globe-stage">
          <svg
            ref={svgRef}
            className="ofoq-globe-svg"
            viewBox="0 0 800 560"
            role="group"
            aria-label={isArabic ? "كرة أرضية تفاعلية للدول المتاحة للاستقطاب" : "Interactive globe of recruitment countries"}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endPointerDrag}
            onPointerCancel={endPointerDrag}
            onKeyDown={(event) => {
              if (event.key === "Escape") resetGlobe();
            }}
          >
            <defs>
              <radialGradient id="ofoq-globe-ocean" cx="37%" cy="29%" r="73%">
                <stop offset="0%" stopColor="#203b68" />
                <stop offset="63%" stopColor="#10294f" />
                <stop offset="100%" stopColor="#071936" />
              </radialGradient>
              <clipPath id="ofoq-globe-clip"><path d={spherePath || undefined} /></clipPath>
            </defs>
            <circle cx="400" cy="282" r="244" fill="#d8cdbd" opacity=".42" />
            <path className="ofoq-globe-sphere" d={spherePath || undefined} fill="url(#ofoq-globe-ocean)" />
            <g clipPath="url(#ofoq-globe-clip)">
              {graticulePath ? <path d={graticulePath} className="ofoq-globe-graticule" /> : null}
              {countryFeatures.map((geography) => {
                const country = featureCountries.byFeatureKey.get(geography.key);
                const isActive = country?._id === activeCountry?._id;
                const isHovered = country?._id === hoveredCountry?._id;
                const d = pathGenerator(geography as never);
                if (!d) return null;
                return (
                  <path
                    key={geography.key}
                    d={d}
                    className={`ofoq-globe-country${country ? " is-recruiting" : ""}${isActive ? " is-active" : ""}${isHovered ? " is-hovered" : ""}`}
                    role={country ? "button" : undefined}
                    tabIndex={country ? 0 : -1}
                    aria-label={country ? `${country.nameAr} · ${country.nameEn}` : undefined}
                    onClick={(event) => {
                      if (!country) return;
                      if (skipNextClickRef.current) {
                        skipNextClickRef.current = false;
                        return;
                      }
                      event.stopPropagation();
                      selectCountry(country);
                    }}
                    onKeyDown={(event) => {
                      if (country && (event.key === "Enter" || event.key === " ")) {
                        event.preventDefault();
                        selectCountry(country);
                      }
                    }}
                    onMouseEnter={() => country && setHoveredCountry(country)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    onFocus={() => country && setHoveredCountry(country)}
                    onBlur={() => setHoveredCountry(null)}
                  />
                );
              })}
              {!activeCountry && recruitmentCountries.map((country) => {
                const coordinates = featureCountries.coordinatesByCountryId.get(country._id);
                if (!coordinates || geoDistance([0, 0], geoRotation(view.rotation)(coordinates)) >= Math.PI / 2) return null;
                const point = projection(coordinates);
                if (!point) return null;
                return (
                  <g
                    key={`location-${country._id}`}
                    transform={`translate(${point[0]} ${point[1]})`}
                    className="ofoq-globe-location"
                    role="button"
                    tabIndex={0}
                    aria-label={`${country.nameAr} · ${country.nameEn}`}
                    onClick={(event) => {
                      if (skipNextClickRef.current) {
                        skipNextClickRef.current = false;
                        return;
                      }
                      event.stopPropagation();
                      selectCountry(country);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectCountry(country);
                      }
                    }}
                    onMouseEnter={() => setHoveredCountry(country)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    onFocus={() => setHoveredCountry(country)}
                    onBlur={() => setHoveredCountry(null)}
                  >
                    <title>{countryName(country)}</title>
                    <circle r="13" fill="transparent" />
                    <circle r="4.5" fill="#C13229" stroke="#F4F1EC" strokeWidth="1.5" />
                  </g>
                );
              })}
            </g>
            {markerLocation ? (
              <g className="ofoq-globe-pin" transform={`translate(${markerLocation.x} ${markerLocation.y})`} aria-hidden="true">
                <path d="M0 7V-33" className="ofoq-globe-pin-line" />
                <path d="M0-34 17-28 0-22Z" className="ofoq-globe-pin-arrow" />
                <circle cx="0" cy="0" r="6.5" className="ofoq-globe-pin-dot" />
                <circle cx="0" cy="0" r="12" className="ofoq-globe-pin-ring" />
              </g>
            ) : null}
            <text x="400" y="548" textAnchor="middle" className="ofoq-globe-caption">
              {highlightedCountry
                ? `${highlightedCountry.nameAr}  ·  ${highlightedCountry.nameEn}`
                : (isArabic ? "مصادر الكفاءات حول العالم" : "Talent sources around the world")}
            </text>
          </svg>
          <div className="ofoq-globe-edge" aria-hidden="true" />
        </div>
      </div>

      <aside className="ofoq-country-details" aria-live="polite">
        {activeCountry ? (
          <>
            <div className="ofoq-detail-country">
              <span className="ofoq-detail-flag" aria-hidden="true">{activeCountry.flag}</span>
              <div>
                <p className="ofoq-detail-eyebrow">{isArabic ? "دولة ضمن الشبكة" : "NETWORK COUNTRY"}</p>
                <h2>{countryName(activeCountry)}</h2>
                <p className="ofoq-detail-bilingual">{activeCountry.nameAr} · {activeCountry.nameEn}</p>
              </div>
            </div>
            <div className="ofoq-detail-copy">
              <p className="ofoq-detail-caption">{isArabic ? "عن مسار الاستقطاب" : "RECRUITMENT PROFILE"}</p>
              <p className="ofoq-detail-description" dir="rtl">
                <span>{activeCountry.descriptionAr || `نستقطب الكفاءات من ${activeCountry.nameAr} لدعم احتياجات الأعمال في المملكة.`}</span>
                <span className="ofoq-detail-language">العربية</span>
              </p>
              <p className="ofoq-detail-description" dir="ltr">
                <span>{activeCountry.descriptionEn || `OFOQ connects Saudi employers with qualified talent from ${activeCountry.nameEn}.`}</span>
                <span className="ofoq-detail-language">ENGLISH</span>
              </p>
            </div>
            <div className="ofoq-detail-meta">
              <span>{isArabic ? "حالة الاستقطاب" : "Recruitment status"}</span>
              <strong>{isArabic ? "الطلبات متاحة" : "Applications open"}</strong>
            </div>
            <div className="ofoq-detail-meta ofoq-detail-rank">
              <span>{isArabic ? "ترتيب الشبكة" : "Network order"}</span>
              <strong>#{activeCountry.order}</strong>
            </div>
            <Link to={`/client/register?country=${encodeURIComponent(activeCountry.code)}`} className="ofoq-request-link">
              {requestLabel}<span aria-hidden="true">{isArabic ? "←" : "→"}</span>
            </Link>
          </>
        ) : (
          <div className="ofoq-detail-empty">
            <span className="ofoq-detail-orbit" aria-hidden="true"><i /></span>
            <p className="ofoq-detail-eyebrow">{isArabic ? "شبكة أفق" : "OFOQ NETWORK"}</p>
            <h2>{isArabic ? "الكفاءات أقرب مما تظن" : "Talent, within reach."}</h2>
            <p>{isArabic
              ? "استكشف الدول التي نصل من خلالها إلى المواهب الدولية، واختر دولة لمعرفة تفاصيل الاستقطاب."
              : "Explore the countries where we source international talent. Select one to see its recruitment profile."}</p>
          </div>
        )}
        <div className="ofoq-detail-footer">
          <span>{isArabic ? "الاستقطاب الدولي" : "INTERNATIONAL TALENT"}</span>
          <span className="ofoq-detail-rule" />
          <span>OFOQ</span>
        </div>
      </aside>
    </div>
  );
}
