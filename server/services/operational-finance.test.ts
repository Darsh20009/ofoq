import assert from "node:assert/strict";
import test from "node:test";
import { cents, money, remaining, settlementStatus } from "./operational-finance.js";

test("remaining subtracts cash and credit independently, without floating-point residue", () => {
  assert.equal(remaining({ total: 115, paidAmount: 20, creditedAmount: 30 }), 65);
  assert.equal(remaining({ total: 0.3, paidAmount: 0.1, creditedAmount: 0.2 }), 0);
  assert.equal(remaining({ total: 10, paidAmount: 11 }), 0);
});
test("a credit-only settlement is not cash, but clears the invoice", () => {
  assert.equal(settlementStatus({ total: 115, creditedAmount: 115, paidAmount: 0 }), "paid");
  assert.equal(settlementStatus({ total: 115, creditedAmount: 15 }), "partial");
  assert.equal(settlementStatus({ total: 115 }), "sent");
  assert.equal(settlementStatus({ total: 115, dueDate: new Date("2020-01-01") }), "overdue");
});
test("six-decimal net unit prices preserve tax-inclusive source totals to the halala", () => {
  for (const gross of [115, 10500, 8212, 0.23, 99.99]) {
    const unit = Math.round(gross / 1.15 * 1_000_000) / 1_000_000;
    assert.equal(cents(money(unit) + money(unit * .15)), cents(gross));
  }
});
