import { LANGS } from "../client/src/i18n/extraLangs";
import { getUiCopy } from "../client/src/i18n/ui";

type Leaf = [path: string, value: string];

function leaves(value: unknown, path = ""): Leaf[] {
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      leaves(child, path ? `${path}.${key}` : key),
    );
  }
  return [[path, String(value ?? "")]];
}

const reference = leaves(getUiCopy("en"));
const expectedPaths = reference.map(([path]) => path);
const intentionallyBlank = new Set(["packages.badges.0"]);
let failed = false;

for (const { code, label } of LANGS) {
  const values = new Map(leaves(getUiCopy(code)));
  const missing = expectedPaths.filter((path) => !values.has(path));
  const empty = expectedPaths.filter(
    (path) => !intentionallyBlank.has(path) && !values.get(path)?.trim(),
  );

  if (missing.length || empty.length) {
    failed = true;
    console.error(
      `${label} (${code}): ${missing.length} missing, ${empty.length} empty`,
    );
    if (missing.length) console.error("  Missing:", missing.join(", "));
    if (empty.length) console.error("  Empty:", empty.join(", "));
  } else {
    console.log(`${label} (${code}): complete`);
  }
}

if (failed) process.exit(1);