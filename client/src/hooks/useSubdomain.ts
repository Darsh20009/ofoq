/**
 * كشف النطاق الفرعي الحالي
 * employee.ofoqhc.com  → isEmployee = true
 * في بيئة التطوير: localStorage.setItem('__emp__','1') لاختبار البوابة
 */
export function useSubdomain() {
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  let devOverride = false;
  try {
    devOverride = typeof localStorage !== "undefined" && localStorage.getItem("__emp__") === "1";
  } catch {
    // localStorage unavailable (private browsing, sandboxed iframe, etc.)
  }

  const isEmployee =
    hostname === "employee.ofoqhc.com" ||
    hostname.startsWith("employee.") ||
    devOverride;

  return { isEmployee };
}
