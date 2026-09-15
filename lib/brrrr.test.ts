import { describe, it, expect } from "vitest";
import { pmt } from "./finance";
import { analyzeBRRRR, DealInputs } from "./brrrr";

// Externally verifiable amortization values (standard mortgage tables)
describe("pmt", () => {
  it("computes $100k at 9% over 30 years as ~$804.62/mo", () => {
    expect(pmt(100000, 9, 30)).toBeCloseTo(804.62, 2);
  });

  it("computes $200k at 6% over 15 years as ~$1687.71/mo", () => {
    expect(pmt(200000, 6, 15)).toBeCloseTo(1687.71, 2);
  });

  it("handles 0% interest as straight division", () => {
    expect(pmt(12000, 0, 1)).toBeCloseTo(1000, 2);
  });
});

const baseInputs: DealInputs = {
  purchasePrice: 229000,
  rehabCosts: 7500,
  closingCosts: 3500,
  arv: 295000,
  monthlyRent: 2400,
  propertyTaxes: 2802,
  insurance: 225,
  vacancyPercent: 5,
  maintenancePercent: 2,
  managementPercent: 3,
  refiLTV: 80,
  refiInterestRate: 9,
  loanTermYears: 30,
};

describe("analyzeBRRRR", () => {
  it("computes total investment as PP + RC + CC", () => {
    const r = analyzeBRRRR(baseInputs, { isTaxesAnnual: true, isInsuranceAnnual: false });
    expect(r.totalInvestment).toBe(229000 + 7500 + 3500);
  });

  it("splits financing 75% first mortgage / 25% + rehab + closing on LoC", () => {
    const r = analyzeBRRRR(baseInputs, { isTaxesAnnual: true, isInsuranceAnnual: false });
    expect(r.firstMortgage).toBe(229000 * 0.75);
    expect(r.locAmount).toBe(229000 * 0.25 + 7500 + 3500);
    // Both loans together cover the full investment
    expect(r.firstMortgage + r.locAmount).toBeCloseTo(r.totalInvestment, 6);
  });

  it("computes refi loan as ARV × LTV", () => {
    const r = analyzeBRRRR(baseInputs, { isTaxesAnnual: true, isInsuranceAnnual: false });
    expect(r.refiLoan).toBe(295000 * 0.8);
    expect(r.refiGap).toBeCloseTo(r.refiLoan - (r.firstMortgage + r.locAmount), 6);
  });

  it("treats taxes/insurance as annual or monthly per flags", () => {
    const annual = analyzeBRRRR(baseInputs, { isTaxesAnnual: true, isInsuranceAnnual: true });
    const monthly = analyzeBRRRR(baseInputs, { isTaxesAnnual: false, isInsuranceAnnual: false });
    // Monthly interpretation of the same numbers costs 12× more per month
    const annualTaxPortion = 2802 / 12 + 225 / 12;
    const monthlyTaxPortion = 2802 + 225;
    expect(monthly.operatingExpenses - annual.operatingExpenses).toBeCloseTo(
      monthlyTaxPortion - annualTaxPortion,
      6
    );
  });

  it("returns verdict 'bad' when refi does not clear the debt", () => {
    const r = analyzeBRRRR(
      { ...baseInputs, arv: 200000 }, // refi loan (160k) < debt (240k)
      { isTaxesAnnual: true, isInsuranceAnnual: false }
    );
    expect(r.refiGap).toBeLessThan(0);
    expect(r.verdict).toBe("bad");
  });

  it("returns verdict 'bad' when post-refi cash flow is negative", () => {
    const r = analyzeBRRRR(
      { ...baseInputs, monthlyRent: 1500 },
      { isTaxesAnnual: true, isInsuranceAnnual: false }
    );
    expect(r.postRefiCashFlow).toBeLessThan(0);
    expect(r.verdict).toBe("bad");
  });

  it("returns verdict 'good' when refi clears debt and cash flow ≥ $200/mo", () => {
    const r = analyzeBRRRR(
      { ...baseInputs, purchasePrice: 120000, arv: 200000, monthlyRent: 2800 },
      { isTaxesAnnual: true, isInsuranceAnnual: false }
    );
    expect(r.refiGap).toBeGreaterThanOrEqual(0);
    expect(r.postRefiCashFlow).toBeGreaterThanOrEqual(200);
    expect(r.verdict).toBe("good");
  });

  it("returns verdict 'borderline' when refi clears debt but cash flow is under $200/mo", () => {
    // Find rent producing 0 <= postRefiCashFlow < 200 with debt cleared
    const inputs = { ...baseInputs, purchasePrice: 120000, arv: 200000, monthlyRent: 2000 };
    const r = analyzeBRRRR(inputs, { isTaxesAnnual: true, isInsuranceAnnual: false });
    expect(r.refiGap).toBeGreaterThanOrEqual(0);
    expect(r.postRefiCashFlow).toBeGreaterThanOrEqual(0);
    expect(r.postRefiCashFlow).toBeLessThan(200);
    expect(r.verdict).toBe("borderline");
  });

  it("caps max purchase price by the ARV × LTV refi ceiling", () => {
    const r = analyzeBRRRR(baseInputs, { isTaxesAnnual: true, isInsuranceAnnual: false });
    expect(r.maxPurchasePrice).toBeLessThanOrEqual(
      baseInputs.arv * (baseInputs.refiLTV / 100) - baseInputs.rehabCosts - baseInputs.closingCosts
    );
  });

  it("matches the previously shipped output for the default inputs (regression)", () => {
    const r = analyzeBRRRR(baseInputs, { isTaxesAnnual: true, isInsuranceAnnual: false });
    // Values locked in from the pre-refactor implementation in app/page.tsx
    expect(r.totalInvestment).toBe(240000);
    expect(r.firstMortgage).toBe(171750);
    expect(r.locAmount).toBe(68250);
    expect(r.refiLoan).toBe(236000);
    expect(r.refiGap).toBeCloseTo(-4000, 6);
    expect(r.verdict).toBe("bad");
  });
});
