"use client";

import { useState } from "react";
import Link from "next/link";
import { pmt, currency, round2 } from "../../lib/finance";

interface PropertyInputs {
  squareFoot: number;
  bedrooms: number;
  bath: number;
  startingBid: number;
  offer: number;
  timeline: number;
  taxesAnnual: number;
  insuranceMonthly: number;
  appraisedValue1: number;
  appraisedValue2: number;
  appraisedValue3: number;
  appraisedValue4: number;
  rehabType: "light" | "medium" | "heavy";
  firstMortgageLTV: number;
}

interface PropertyAnalysis {
  maxBidPrice: number;
  purchasePrice70_30: number;
  averageAppraisedValue: number;
  repairs: number;
  firstMortgageAmount: number;
  secondMortgageAmount: number;
  firstMortgagePayment: number;
  secondMortgagePayment: number;
  taxesMonthly: number;
  insuranceMonthly: number;
  taxesAndInsurance: number;
  monthlyCarryingCost: number;
  carryingCost: number;
  totalLineOfCredit: number;
  lineOfCreditPayment: number;
  profitAndLoss: number;
  totalSpend: number;
  loanToValue: number;
  verdict: "good" | "marginal" | "bad";
}

export default function PropertyAnalyzerPage() {
  const [inputs, setInputs] = useState<PropertyInputs>({
    squareFoot: 1500,
    bedrooms: 3,
    bath: 2,
    startingBid: 200000,
    offer: 180000,
    timeline: 6,
    taxesAnnual: 3600,
    insuranceMonthly: 150,
    appraisedValue1: 250000,
    appraisedValue2: 240000,
    appraisedValue3: 260000,
    appraisedValue4: 245000,
    rehabType: "medium",
    firstMortgageLTV: 75,
  });

  const updateInput = (field: keyof PropertyInputs, value: string) => {
    setInputs(prev => ({
      ...prev,
      [field]: field === 'rehabType' ? value as "light" | "medium" | "heavy" : parseFloat(value) || 0
    }));
  };

  const calculatePropertyAnalysis = (): PropertyAnalysis => {
    const {
      squareFoot,
      offer,
      timeline,
      taxesAnnual,
      insuranceMonthly,
      appraisedValue1,
      appraisedValue2,
      appraisedValue3,
      appraisedValue4,
      rehabType,
      firstMortgageLTV
    } = inputs;

    // Rehab cost per square foot based on type
    const rehabCosts = {
      light: 26,
      medium: 37,
      heavy: 60
    };

    
    
    // Average Appraised Value
    const averageAppraisedValue = (appraisedValue1 + appraisedValue2 + appraisedValue3 + appraisedValue4) / 4;

    // Max Bid / Price (50%)
    const maxBidPrice = averageAppraisedValue / 2;

    // Repairs: Square Foot X Cost per sq ft based on rehab type
    const repairs = squareFoot * rehabCosts[rehabType];

    // 70/30 purchase price: (Average Appraised Value X .70) - Repairs
    const purchasePrice70_30 = (averageAppraisedValue * 0.70) - repairs;

    // Loan Amounts
    // First mortgage: Offer X LTV% at 9% over 30 years
    const firstMortgageAmount = offer * (firstMortgageLTV / 100);
    const firstMortgagePayment = pmt(firstMortgageAmount, 9, 30);

    // Second mortgage: Offer X (100 - LTV)% at 9% over 30 years
    const secondMortgageAmount = offer * ((100 - firstMortgageLTV) / 100);
    const secondMortgagePayment = pmt(secondMortgageAmount, 9, 30);

    // Taxes and Insurance: (Annual taxes / 12) + Monthly insurance
    const taxesMonthly = taxesAnnual / 12;
    const taxesAndInsurance = taxesMonthly + insuranceMonthly;

    // Monthly Carrying Cost (all monthly payments during flip)
    const monthlyCarryingCost = firstMortgagePayment + secondMortgagePayment + taxesAndInsurance;
    
    // Total Carrying Cost (monthly × timeline)
    const carryingCost = monthlyCarryingCost * timeline;

    // Total Line of Credit needed: Second mortgage + Repairs + Carrying costs
    const totalLineOfCredit = secondMortgageAmount + repairs + carryingCost;
    
    // Line of Credit monthly payment at 9% over 30 years
    const lineOfCreditPayment = pmt(totalLineOfCredit, 9, 30);

    // Total Spend: Offer + Repairs + Carrying Cost
    const totalSpend = offer + repairs + carryingCost;

    // Profit and Loss: Average Appraised Value - (Offer + Repairs + Carrying Cost)
    const profitAndLoss = averageAppraisedValue - totalSpend;

    // Loan to Value: Total Spend / Average Appraised Value
    const loanToValue = (totalSpend / averageAppraisedValue) * 100;

    // Verdict Logic
    let verdict: "good" | "marginal" | "bad";
    if (profitAndLoss >= 40000) {
      verdict = "good";
    } else if (profitAndLoss >= 0) {
      verdict = "marginal";
    } else {
      verdict = "bad";
    }

    return {
      maxBidPrice,
      purchasePrice70_30,
      averageAppraisedValue,
      repairs,
      firstMortgageAmount,
      secondMortgageAmount,
      firstMortgagePayment,
      secondMortgagePayment,
      taxesMonthly,
      insuranceMonthly,
      taxesAndInsurance,
      monthlyCarryingCost,
      carryingCost,
      totalLineOfCredit,
      lineOfCreditPayment,
      profitAndLoss,
      totalSpend,
      loanToValue,
      verdict
    };
  };

  const results = calculatePropertyAnalysis();

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "good": return "text-green-600 bg-green-50 border-green-200";
      case "marginal": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "bad": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case "good": return "✅";
      case "marginal": return "⚠️";
      case "bad": return "❌";
      default: return "❓";
    }
  };

  const getProfitLossColor = (profitLoss: number) => {
    if (profitLoss >= 40000) return "text-green-600";
    if (profitLoss >= 0) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Flip Deal Analyzer
            </h1>
            <p className="text-gray-600">
              Analyze flip deals with comprehensive financial calculations
            </p>
          </div>
          <Link 
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            ← BRRRR Analyzer
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Flip Deal Inputs
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Square Foot
                </label>
                <input
                  type="number"
                  value={inputs.squareFoot}
                  onChange={(e) => updateInput('squareFoot', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms (Total)
                </label>
                <input
                  type="number"
                  value={inputs.bedrooms}
                  onChange={(e) => updateInput('bedrooms', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bath (Total)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={inputs.bath}
                  onChange={(e) => updateInput('bath', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Starting Bid (Dollars)
                </label>
                <input
                  type="number"
                  value={inputs.startingBid}
                  onChange={(e) => updateInput('startingBid', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Offer (Dollars)
                </label>
                <input
                  type="number"
                  value={inputs.offer}
                  onChange={(e) => updateInput('offer', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeline (Months)
                </label>
                <input
                  type="number"
                  value={inputs.timeline}
                  onChange={(e) => updateInput('timeline', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taxes (Annual)
                </label>
                <input
                  type="number"
                  value={inputs.taxesAnnual}
                  onChange={(e) => updateInput('taxesAnnual', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance (Monthly)
                </label>
                <input
                  type="number"
                  value={inputs.insuranceMonthly}
                  onChange={(e) => updateInput('insuranceMonthly', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rehab Type
                </label>
                <select
                  value={inputs.rehabType}
                  onChange={(e) => updateInput('rehabType', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="light">Light Rehab - $26/sq ft</option>
                  <option value="medium">Medium Rehab - $37/sq ft</option>
                  <option value="heavy">Heavy Rehab - $60/sq ft</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Mortgage LTV (%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="95"
                  step="5"
                  value={inputs.firstMortgageLTV}
                  onChange={(e) => updateInput('firstMortgageLTV', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Second mortgage will be {100 - inputs.firstMortgageLTV}%
                </p>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Appraised Values</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Appraised Value 1 (Dollars)
                    </label>
                    <input
                      type="number"
                      value={inputs.appraisedValue1}
                      onChange={(e) => updateInput('appraisedValue1', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Appraised Value 2 (Dollars)
                    </label>
                    <input
                      type="number"
                      value={inputs.appraisedValue2}
                      onChange={(e) => updateInput('appraisedValue2', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Appraised Value 3 (Dollars)
                    </label>
                    <input
                      type="number"
                      value={inputs.appraisedValue3}
                      onChange={(e) => updateInput('appraisedValue3', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Appraised Value 4 (Dollars)
                    </label>
                    <input
                      type="number"
                      value={inputs.appraisedValue4}
                      onChange={(e) => updateInput('appraisedValue4', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Verdict */}
          <div className={`rounded-2xl p-6 border-2 ${getVerdictColor(results.verdict)}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{getVerdictIcon(results.verdict)}</span>
              <h2 className="text-2xl font-bold">
                Deal Verdict: {results.verdict.toUpperCase()}
              </h2>
            </div>
            <p className="text-sm">
              {results.verdict === "good" && "✅ Profit/Loss is $40,000+ - This is a great deal!"}
              {results.verdict === "marginal" && "⚠️ Profit/Loss is positive but under $40,000 - Marginal deal"}
              {results.verdict === "bad" && "❌ Profit/Loss is negative - This is a bad deal"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Calculations */}
            <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Main Calculations</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Bid/Price (50%):</span>
                  <span className="font-semibold">{currency(results.maxBidPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">70/30 Purchase Price:</span>
                  <span className="font-semibold">{currency(results.purchasePrice70_30)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Appraised Value:</span>
                  <span className="font-semibold">{currency(results.averageAppraisedValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Repairs:</span>
                  <span className="font-semibold">{currency(results.repairs)}</span>
                </div>
              </div>
            </div>

            {/* Financial Analysis */}
            <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Carrying Cost:</span>
                  <span className="font-semibold">{currency(results.carryingCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Spend:</span>
                  <span className="font-semibold">{currency(results.totalSpend)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Loan to Value:</span>
                  <span className="font-semibold">{round2(results.loanToValue)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profit and Loss:</span>
                  <span className={`font-semibold ${getProfitLossColor(results.profitAndLoss)}`}>
                    {currency(results.profitAndLoss)}
                  </span>
                </div>
              </div>
            </div>

            {/* Loan Details */}
            <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Loan Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">First Mortgage ({inputs.firstMortgageLTV}% of offer):</span>
                  <span className="font-semibold">{currency(results.firstMortgageAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Second Mortgage ({100 - inputs.firstMortgageLTV}% of offer):</span>
                  <span className="font-semibold">{currency(results.secondMortgageAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Repairs:</span>
                  <span className="font-semibold">{currency(results.repairs)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Carrying Costs ({inputs.timeline} months):</span>
                  <span className="font-semibold">{currency(results.carryingCost)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600 font-medium">Total Line of Credit Needed:</span>
                  <span className="font-semibold text-blue-600">{currency(results.totalLineOfCredit)}</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  <p><strong>Breakdown:</strong> Down payment ({currency(results.secondMortgageAmount)}) + Repairs ({currency(results.repairs)}) + Carrying costs ({currency(results.carryingCost)}) = {currency(results.totalLineOfCredit)}</p>
                  <p className="mt-1"><strong>Note:</strong> Carrying costs include second mortgage payments, so the line of credit covers the down payment + repairs + all monthly payments during flip.</p>
                </div>
              </div>
            </div>

            {/* Carrying Cost Breakdown */}
            <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Carrying Cost Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">First Mortgage ({inputs.firstMortgageLTV}% @ 9%):</span>
                  <span className="font-semibold">{currency(results.firstMortgagePayment)}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Second Mortgage + Carrying costs + Repairs At 9%:</span>
                  <span className="font-semibold">{currency(results.lineOfCreditPayment)}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes (Annual ÷ 12):</span>
                  <span className="font-semibold">{currency(results.taxesMonthly)}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Insurance (Monthly):</span>
                  <span className="font-semibold">{currency(results.insuranceMonthly)}/mo</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600 font-medium">Monthly Total:</span>
                  <span className="font-semibold">{currency(results.monthlyCarryingCost)}/mo</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600 font-medium">Total ({inputs.timeline} months):</span>
                  <span className="font-semibold">{currency(results.carryingCost)}</span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-200 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommendations</h3>
              <div className="space-y-3">
                {results.verdict === "good" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-green-800">✅ Excellent Deal!</p>
                    <p className="text-sm text-green-700">
                      This property shows a profit of {currency(results.profitAndLoss)}, 
                      which exceeds your $40,000 target. Proceed with confidence!
                    </p>
                  </div>
                )}
                
                {results.verdict === "marginal" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-yellow-800">⚠️ Marginal Deal</p>
                    <p className="text-sm text-yellow-700">
                      Profit of {currency(results.profitAndLoss)} is positive but below your $40,000 target. 
                      Consider negotiating the offer price down to improve margins.
                    </p>
                    <p className="text-xs text-yellow-600 mt-2">
                      Target offer for $40k profit: {currency(results.averageAppraisedValue - 40000 - results.repairs - results.carryingCost)}
                    </p>
                  </div>
                )}
                
                {results.verdict === "bad" && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-red-800">❌ Poor Deal</p>
                    <p className="text-sm text-red-700">
                      This deal shows a loss of {currency(Math.abs(results.profitAndLoss))}. 
                      Consider walking away or significantly reducing your offer.
                    </p>
                    <p className="text-xs text-red-600 mt-2">
                      Break-even offer: {currency(results.averageAppraisedValue - results.repairs - results.carryingCost)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
