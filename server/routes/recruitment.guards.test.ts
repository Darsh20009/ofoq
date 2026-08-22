/**
 * recruitment.guards.test.ts
 *
 * Executable guard-condition assertions for the recruitment route layer.
 * Run with:  npx tsx server/routes/recruitment.guards.test.ts
 *
 * This file does NOT start the HTTP server or connect to MongoDB.
 * It validates the pure, synchronous decision logic that each guarded
 * route handler uses, so the rules are verifiable without I/O.
 *
 * Each `assert` call will throw with a descriptive message on failure.
 * A passing run prints "All guard assertions passed." and exits 0.
 */

import assert from "node:assert/strict";

// ─────────────────────────────────────────────────────────────────────────────
// Replicated decision logic (must stay in sync with recruitment.routes.ts)
// ─────────────────────────────────────────────────────────────────────────────

type RequestKind = "general" | "named_candidates" | "recruitment";
type Role = "client" | "admin" | "super_admin" | "manager" | "employee";

const PRIVILEGED_ROLES: Role[] = ["admin", "super_admin", "manager", "employee"];

/**
 * GUARD 0 — requireExactClient middleware
 *
 * All client-facing routes (no /admin/ prefix) require role === "client" exactly.
 * Any privileged role must use the /admin/ routes instead.
 */
function isExactClientAllowed(role: Role): boolean {
  return role === "client";
}

/**
 * GUARD 1 — admin-sourced candidate CREATION
 *
 * POST /admin/requests/:id/candidates
 * isAdminSourced candidates may only be created when sr.requestKind === "recruitment".
 */
function canAdminCreateSourcingCandidate(srKind: RequestKind): boolean {
  return srKind === "recruitment";
}

/**
 * GUARD 2 — client self-submission
 *
 * POST /requests/:id/candidates
 * Role must be exactly "client" (enforced by requireExactClient before this check).
 * The SR must additionally have requestKind === "named_candidates".
 * There is NO privileged bypass — admins must use POST /admin/requests/:id/candidates.
 */
function canClientSubmitCandidate(srKind: RequestKind): boolean {
  // requireExactClient has already rejected non-client roles before this point.
  return srKind === "named_candidates";
}

/**
 * GUARD 3 — isAdminSourced immutability in PATCH
 *
 * PATCH /admin/requests/:id/candidates/:cid
 * The body must NOT include isAdminSourced.
 */
function isAdminSourcedImmutableViolation(body: Record<string, unknown>): boolean {
  return "isAdminSourced" in body;
}

/**
 * GUARD 4 — admin document upload defense-in-depth
 *
 * POST /admin/requests/:id/candidates/:cid/documents
 * An admin-sourced candidate's documents must only be uploaded on recruitment requests.
 * (Normally unreachable due to Guard 1, but protects against stale data / future bugs.)
 */
function adminDocUploadBlocked(
  candidateIsAdminSourced: boolean,
  srKind: RequestKind,
): boolean {
  return candidateIsAdminSourced && srKind !== "recruitment";
}

/**
 * GUARD 5 — client document upload
 *
 * POST /requests/:id/candidates/:cid/documents
 * Role is already restricted to "client" by requireExactClient.
 * Client may not upload to admin-sourced candidates regardless.
 */
function clientDocUploadBlocked(candidateIsAdminSourced: boolean): boolean {
  return candidateIsAdminSourced;
}

/**
 * GUARD 6 — client candidate delete
 *
 * DELETE /requests/:id/candidates/:cid
 * Role is already restricted to "client" by requireExactClient.
 * Client may not delete admin-sourced candidates; must be the submitter.
 */
function clientDeleteBlocked(
  candidateIsAdminSourced: boolean,
  submittedByUserId: string,
  requestingUserId: string,
): boolean {
  if (candidateIsAdminSourced) return true;
  return submittedByUserId !== requestingUserId;
}

// ─────────────────────────────────────────────────────────────────────────────
// Assertions
// ─────────────────────────────────────────────────────────────────────────────

// ── GUARD 0 — requireExactClient ─────────────────────────────────────────────

assert.equal(
  isExactClientAllowed("client"), true,
  "client role is permitted on client routes",
);

for (const role of PRIVILEGED_ROLES) {
  assert.equal(
    isExactClientAllowed(role), false,
    `privileged role "${role}" must be rejected on client routes (use /admin/ routes)`,
  );
}

// ── GUARD 1 — admin-sourced creation kind restriction ────────────────────────

assert.equal(
  canAdminCreateSourcingCandidate("recruitment"), true,
  "Admin may create sourcing candidate on recruitment request",
);
assert.equal(
  canAdminCreateSourcingCandidate("named_candidates"), false,
  "Admin must NOT create sourcing candidate on named_candidates request",
);
assert.equal(
  canAdminCreateSourcingCandidate("general"), false,
  "Admin must NOT create sourcing candidate on general request",
);

// ── GUARD 2 — client self-submission kind restriction ────────────────────────
// NOTE: requireExactClient has already blocked privileged roles before these
// checks; the function no longer accepts a role parameter — there is no bypass.

assert.equal(
  canClientSubmitCandidate("named_candidates"), true,
  "Client may submit candidate on named_candidates request",
);
assert.equal(
  canClientSubmitCandidate("recruitment"), false,
  "Client must NOT self-submit on recruitment request",
);
assert.equal(
  canClientSubmitCandidate("general"), false,
  "Client must NOT self-submit on general request",
);

// Verify that privileged roles are ALL blocked at the middleware layer (Guard 0)
// before they can even reach Guard 2's kind check.
for (const role of PRIVILEGED_ROLES) {
  assert.equal(
    isExactClientAllowed(role), false,
    `Guard 0 blocks "${role}" before Guard 2 kind check is reached — no bypass exists`,
  );
}

// ── GUARD 3 — isAdminSourced immutability ────────────────────────────────────

assert.equal(
  isAdminSourcedImmutableViolation({ isAdminSourced: true, fullName: "Test" }), true,
  "Body containing isAdminSourced must be rejected",
);
assert.equal(
  isAdminSourcedImmutableViolation({ fullName: "Test", clientVisible: true }), false,
  "Body without isAdminSourced must pass",
);

// ── GUARD 4 — admin doc upload defense-in-depth ──────────────────────────────

assert.equal(
  adminDocUploadBlocked(true, "named_candidates"), true,
  "Admin-sourced candidate doc upload blocked on named_candidates request",
);
assert.equal(
  adminDocUploadBlocked(true, "general"), true,
  "Admin-sourced candidate doc upload blocked on general request",
);
assert.equal(
  adminDocUploadBlocked(true, "recruitment"), false,
  "Admin-sourced candidate doc upload allowed on recruitment request",
);
assert.equal(
  adminDocUploadBlocked(false, "named_candidates"), false,
  "Client-owned candidate doc upload not blocked by this guard",
);

// ── GUARD 5 — client doc upload to admin-sourced candidate ───────────────────
// (requireExactClient has already enforced role === "client")

assert.equal(
  clientDocUploadBlocked(true), true,
  "Client must NOT upload docs to admin-sourced candidate",
);
assert.equal(
  clientDocUploadBlocked(false), false,
  "Client may upload docs to their own candidate",
);

// ── GUARD 6 — client delete ──────────────────────────────────────────────────
// (requireExactClient has already enforced role === "client")

assert.equal(
  clientDeleteBlocked(true, "any", "clientA"), true,
  "Client must NOT delete admin-sourced candidate",
);
assert.equal(
  clientDeleteBlocked(false, "clientA", "clientB"), true,
  "Client must NOT delete a candidate submitted by another client",
);
assert.equal(
  clientDeleteBlocked(false, "clientA", "clientA"), false,
  "Client may delete their own candidate",
);

// ─────────────────────────────────────────────────────────────────────────────
// Completeness checks
// ─────────────────────────────────────────────────────────────────────────────
const allKinds: RequestKind[] = ["general", "named_candidates", "recruitment"];
const allRoles: Role[] = ["client", "admin", "super_admin", "manager", "employee"];

// Exactly one kind allows admin-sourced creation
const allowedForAdminCreate = allKinds.filter(canAdminCreateSourcingCandidate);
assert.deepEqual(allowedForAdminCreate, ["recruitment"],
  "Only 'recruitment' requestKind allows admin-sourced candidate creation");

// Exactly one kind allows client self-submission
const allowedForClientSubmit = allKinds.filter(canClientSubmitCandidate);
assert.deepEqual(allowedForClientSubmit, ["named_candidates"],
  "Only 'named_candidates' requestKind allows client self-submission");

// Exactly one role is permitted on client routes
const allowedOnClientRoutes = allRoles.filter(isExactClientAllowed);
assert.deepEqual(allowedOnClientRoutes, ["client"],
  "Only role 'client' is permitted on client-facing routes");

// Every privileged role is blocked from client routes
const blockedFromClientRoutes = allRoles.filter((r) => !isExactClientAllowed(r));
assert.deepEqual(
  blockedFromClientRoutes,
  ["admin", "super_admin", "manager", "employee"],
  "All privileged roles must be blocked from client-facing routes",
);

console.log("All guard assertions passed. ✓");
