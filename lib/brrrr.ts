import { pmt } from "./finance";

export interface DealInputs {
  purchasePrice: number;
  rehabCosts: number;
  closingCosts: number;
  arv: number;
  monthlyRent: number;
  propertyTaxes: number;
  insurance: number;
  vacancyPercent: number;
  maintenancePercent: number;
  managementPercent: number;
  refiLTV: number;
  refiInterestRate: number;
  loanTermYears: number;
}

export interface DealAnalysis {
  totalInvestment: number;
  firstMortgage: number;
  locAmount: number;
  acquisitionDebtService: number;
  operatingExpenses: number;
  noi: number;
  preRefiCashFlow: number;
  refiLoan: number;
  refiGap: number;
  newDebtService: number;
  postRefiCashFlow: number;
  verdict: "good" | "borderline" | "bad";
  maxPurchasePrice: number;
}

export interface AnalysisOptions {
  isTaxesAnnual: boolean;
  isInsuranceAnnual: boolean;
}

export function analyzeBRRRR(inputs: DealInputs, options: AnalysisOptions): DealAnalysis {
  const {
    purchasePrice,
    rehabCosts,
    closingCosts,
    arv,
    monthlyRent,
    propertyTaxes,
    insurance,
    vacancyPercent,
    maintenancePercent,
    managementPercent,
    refiLTV,
    refiInterestRate,
    loanTermYears,
  } = inputs;
  const { isTaxesAnnual, isInsuranceAnnual } = options;

  // 1. Total Investment
  const totalInvestment = purchasePrice + rehabCosts + closingCosts;

  // 2. Loan Split
  const firstMortgage = purchasePrice * 0.75; // 75% of PP
  const locAmount = (purchasePrice * 0.25) + rehabCosts + closingCosts; // 25% of PP + RC + CC

  // 3. Monthly Debt Service (Acquisition)
  const firstMortgagePayment = pmt(firstMortgage, 9, loanTermYears);
  const locPayment = pmt(locAmount, 9, loanTermYears);
  const acquisitionDebtService = firstMortgagePayment + locPayment;

  // 4. Operating Expenses
  const monthlyTaxes = isTaxesAnnual ? propertyTaxes / 12 : propertyTaxes;
  const monthlyInsurance = isInsuranceAnnual ? insurance / 12 : insurance;
  const vacancyReserve = monthlyRent * (vacancyPercent / 100);
  const maintenanceReserve = monthlyRent * (maintenancePercent / 100);
  const managementFee = monthlyRent * (managementPercent / 100);

  const operatingExpenses = monthlyTaxes + monthlyInsurance + vacancyReserve + maintenanceReserve + managementFee;

  // 5. NOI and Pre-Refi Cash Flow
  const noi = monthlyRent - operatingExpenses;
  const preRefiCashFlow = noi - acquisitionDebtService;

  // 6. Refinance Analysis
  const refiLoan = arv * (refiLTV / 100);
  const refiGap = refiLoan - (firstMortgage + locAmount);
  const newDebtService = pmt(refiLoan, refiInterestRate, loanTermYears);
  const postRefiCashFlow = noi - newDebtService;

  // 7. Verdict Logic
  let verdict: "good" | "borderline" | "bad";
  if (refiGap < 0 || postRefiCashFlow < 0) {
    verdict = "bad";
  } else if (postRefiCashFlow >= 200) {
    verdict = "good";
  } else {
    verdict = "borderline";
  }

  // 8. Max purchase price that still yields +$200/mo after refi and clears the LoC.
  // Solve the PMT formula in reverse for the largest refi loan whose payment
  // leaves targetCashFlow, then back out PP (refi must cover PP + RC + CC).
  const targetCashFlow = 200;
  const requiredNOI = monthlyRent - operatingExpenses;
  const maxNewDebtService = requiredNOI - targetCashFlow;

  const monthlyRate = (refiInterestRate / 100) / 12;
  const totalPayments = loanTermYears * 12;

  let maxRefiLoan = 0;
  if (monthlyRate > 0) {
    maxRefiLoan = maxNewDebtService * ((1 - Math.pow(1 + monthlyRate, -totalPayments)) / monthlyRate);
  } else {
    maxRefiLoan = maxNewDebtService * totalPayments;
  }

  const maxPurchasePrice = Math.max(0, maxRefiLoan - rehabCosts - closingCosts);

  // The refi loan can never exceed ARV × LTV
  const maxRefiByARV = arv * (refiLTV / 100);
  const finalMaxPurchasePrice = Math.min(maxPurchasePrice, maxRefiByARV - rehabCosts - closingCosts);

  return {
    totalInvestment,
    firstMortgage,
    locAmount,
    acquisitionDebtService,
    operatingExpenses,
    noi,
    preRefiCashFlow,
    refiLoan,
    refiGap,
    newDebtService,
    postRefiCashFlow,
    verdict,
    maxPurchasePrice: finalMaxPurchasePrice,
  };
}
