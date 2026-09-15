"use client";

import { useState } from "react";
import Link from "next/link";
import { currency } from "../lib/finance";
import { analyzeBRRRR, DealInputs } from "../lib/brrrr";

export default function HomePage() {
  const [inputs, setInputs] = useState<DealInputs>({
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
  });

  const [isTaxesAnnual, setIsTaxesAnnual] = useState(true);
  const [isInsuranceAnnual, setIsInsuranceAnnual] = useState(false);

  const updateInput = (field: keyof DealInputs, value: string) => {
    setInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const results = analyzeBRRRR(inputs, { isTaxesAnnual, isInsuranceAnnual });

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "good": return "text-green-600 bg-green-50 border-green-200";
      case "borderline": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "bad": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case "good": return "✅";
      case "borderline": return "⚠️";
      case "bad": return "❌";
      default: return "❓";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              BRRRR Deal Analyzer
            </h1>
            <p className="text-gray-600">
              Custom financing model: 75% mortgage + 25% + rehab on LoC, both at 9%
            </p>
          </div>
          <Link 
            href="/flip-analyze"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Flip Analyzer →
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Deal Inputs
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Price (PP)
                </label>
                <input
                  type="number"
                  value={inputs.purchasePrice}
                  onChange={(e) => updateInput('purchasePrice', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rehab Costs (RC)
                </label>
                <input
                  type="number"
                  value={inputs.rehabCosts}
                  onChange={(e) => updateInput('rehabCosts', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Closing Costs (CC)
                </label>
                <input
                  type="number"
                  value={inputs.closingCosts}
                  onChange={(e) => updateInput('closingCosts', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  After Repair Value (ARV)
                </label>
                <input
                  type="number"
                  value={inputs.arv}
                  onChange={(e) => updateInput('arv', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Rent
                </label>
                <input
                  type="number"
                  value={inputs.monthlyRent}
                  onChange={(e) => updateInput('monthlyRent', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Taxes
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.propertyTaxes}
                    onChange={(e) => updateInput('propertyTaxes', e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <select
                    value={isTaxesAnnual ? 'annual' : 'monthly'}
                    onChange={(e) => setIsTaxesAnnual(e.target.value === 'annual')}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="annual">Annual</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.insurance}
                    onChange={(e) => updateInput('insurance', e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <select
                    value={isInsuranceAnnual ? 'annual' : 'monthly'}
                    onChange={(e) => setIsInsuranceAnnual(e.target.value === 'annual')}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="annual">Annual</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vacancy Reserve (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.vacancyPercent}
                  onChange={(e) => updateInput('vacancyPercent', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maintenance Reserve (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.maintenancePercent}
                  onChange={(e) => updateInput('maintenancePercent', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Management (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.managementPercent}
                  onChange={(e) => updateInput('managementPercent', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Refi LTV (%)
                </label>
                <input
                  type="number"
                  value={inputs.refiLTV}
                  onChange={(e) => updateInput('refiLTV', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Refi Interest Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.refiInterestRate}
                  onChange={(e) => updateInput('refiInterestRate', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Term (years)
                </label>
                <input
                  type="number"
                  value={inputs.loanTermYears}
                  onChange={(e) => updateInput('loanTermYears', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
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
              {results.verdict === "good" && "✅ Refi clears LoC and cash flow is strong (+$200+/mo)"}
              {results.verdict === "borderline" && "⚠️ Refi covers debt but cash flow is marginal"}
              {results.verdict === "bad" && "❌ Refi doesn't clear LoC OR post-refi cash flow is negative"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Investment Summary */}
            <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Investment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Investment:</span>
                  <span className="font-semibold">{currency(results.totalInvestment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">First Mortgage (75%):</span>
                  <span className="font-semibold">{currency(results.firstMortgage)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">LoC Amount:</span>
                  <span className="font-semibold">{currency(results.locAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Acquisition Debt Service:</span>
                  <span className="font-semibold">{currency(results.acquisitionDebtService)}</span>
                </div>
              </div>
            </div>

            {/* Operating Analysis */}
            <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Operating Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Rent:</span>
                  <span className="font-semibold">{currency(inputs.monthlyRent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Operating Expenses:</span>
                  <span className="font-semibold">{currency(results.operatingExpenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">NOI:</span>
                  <span className={`font-semibold ${results.noi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {currency(results.noi)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pre-Refi Cash Flow:</span>
                  <span className={`font-semibold ${results.preRefiCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {currency(results.preRefiCashFlow)}
                  </span>
                </div>
              </div>
            </div>

            {/* Refinance Analysis */}
            <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Refinance Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Refi Loan ({inputs.refiLTV}% LTV):</span>
                  <span className="font-semibold">{currency(results.refiLoan)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Refi Gap:</span>
                  <span className={`font-semibold ${results.refiGap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {currency(results.refiGap)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">New Debt Service:</span>
                  <span className="font-semibold">{currency(results.newDebtService)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Post-Refi Cash Flow:</span>
                  <span className={`font-semibold ${results.postRefiCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {currency(results.postRefiCashFlow)}
                  </span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommendations</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Purchase Price:</span>
                  <span className="font-semibold text-blue-600">{currency(results.maxPurchasePrice)}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>For +$200/mo cash flow and LoC clearance</p>
                </div>
                
                {results.verdict === "bad" && (
                  <div className="space-y-2">
                    <div className="text-sm text-red-600">
                      <p>❌ This deal doesn't meet BRRRR criteria</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-red-800">Negotiation Target:</p>
                      <p className="text-sm text-red-700">
                        Offer maximum <span className="font-semibold">{currency(results.maxPurchasePrice)}</span> 
                        to achieve $200/mo cash flow
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        Current ask: {currency(inputs.purchasePrice)} | 
                        Savings: {currency(inputs.purchasePrice - results.maxPurchasePrice)}
                      </p>
                    </div>
                  </div>
                )}
                
                {results.verdict === "borderline" && inputs.purchasePrice > results.maxPurchasePrice && (
                  <div className="space-y-2">
                    <div className="text-sm text-yellow-600">
                      <p>⚠️ Consider negotiating purchase price down</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-yellow-800">Negotiation Target:</p>
                      <p className="text-sm text-yellow-700">
                        Offer maximum <span className="font-semibold">{currency(results.maxPurchasePrice)}</span> 
                        to achieve $200/mo cash flow
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Current ask: {currency(inputs.purchasePrice)} | 
                        Savings: {currency(inputs.purchasePrice - results.maxPurchasePrice)}
                      </p>
                    </div>
                  </div>
                )}
                
                {results.verdict === "borderline" && inputs.purchasePrice <= results.maxPurchasePrice && (
                  <div className="space-y-2">
                    <div className="text-sm text-yellow-600">
                      <p>⚠️ Deal is borderline but meets minimum criteria</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-yellow-800">Deal Analysis:</p>
                      <p className="text-sm text-yellow-700">
                        Current offer of {currency(inputs.purchasePrice)} achieves 
                        <span className="font-semibold"> {currency(results.postRefiCashFlow)}/mo</span> cash flow
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        This meets your minimum criteria but could be stronger
                      </p>
                    </div>
                  </div>
                )}
                
                {results.verdict === "good" && (
                  <div className="space-y-2">
                    <div className="text-sm text-green-600">
                      <p>✅ Strong deal - proceed with confidence!</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-800">Deal Analysis:</p>
                      <p className="text-sm text-green-700">
                        Current offer of {currency(inputs.purchasePrice)} achieves 
                        <span className="font-semibold"> {currency(results.postRefiCashFlow)}/mo</span> cash flow
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        You could pay up to {currency(results.maxPurchasePrice)} and still hit $200/mo target
                      </p>
                    </div>
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