# BRRRR Deal Analyzer

A comprehensive real estate deal analysis tool built with Next.js and Tailwind CSS, implementing the BRRRR (Buy, Rehab, Rent, Refinance, Repeat) strategy with custom financing models.

## Features

- **Custom Financing Model**: 75% mortgage + 25% + rehab costs on Line of Credit, both at 9%
- **Comprehensive Analysis**: Pre and post-refinance cash flow calculations
- **Deal Verdict System**: ✅ Good / ⚠️ Borderline / ❌ Bad deal indicators
- **Password Protection**: Basic authentication for secure access
- **Real-time Calculations**: Instant updates as you modify inputs
- **Responsive Design**: Works on desktop and mobile devices

## BRRRR Analysis Includes

1. **Total Investment Calculation**
2. **Loan Split Analysis** (First Mortgage vs LoC)
3. **Operating Expense Breakdown**
4. **NOI and Cash Flow Analysis**
5. **Refinance Gap Analysis**
6. **Post-Refi Cash Flow Projections**
7. **Deal Recommendations**

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dwetherell/BRRRR-Deal-Analyzer.git
cd BRRRR-Deal-Analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```bash
# Basic Authentication
BASIC_AUTH_USER=your_username
BASIC_AUTH_PASS=your_password
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Password Protection

The site is protected with basic authentication. When you first visit, you'll be prompted for username and password. Set these in your `.env.local` file:

```bash
BASIC_AUTH_USER=admin
BASIC_AUTH_PASS=your_secure_password
```

## Input Fields

The analyzer requires the following inputs:

1. **Purchase Price (PP)** - Property purchase price
2. **Rehab Costs (RC)** - Renovation and repair costs
3. **Closing Costs (CC)** - Transaction closing costs
4. **After Repair Value (ARV)** - Estimated value after renovations
5. **Monthly Rent** - Projected rental income
6. **Property Taxes** - Annual or monthly property taxes
7. **Insurance** - Annual or monthly insurance costs
8. **Vacancy Reserve (%)** - Percentage for vacancy allowance
9. **Maintenance Reserve (%)** - Percentage for maintenance costs
10. **Property Management (%)** - Management fee percentage
11. **Refi LTV (%)** - Refinance loan-to-value ratio
12. **Refi Interest Rate (%)** - Refinance interest rate
13. **Loan Term (years)** - Loan term length

## Deal Criteria

### ✅ Good Deal
- Refi clears the Line of Credit (no "down payment debt" remains)
- Post-refi cash flow is positive (ideally above $200/month)

### ⚠️ Borderline Deal
- Refi covers debt but cash flow is only slightly positive

### ❌ Bad Deal
- Refi doesn't clear the LoC, OR
- Post-refi cash flow is negative

## Deployment on Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `BASIC_AUTH_USER`
   - `BASIC_AUTH_PASS`
4. Deploy!

The site will be automatically deployed and accessible at your Vercel URL with password protection enabled.

## Technology Stack

- **Next.js 15** - React framework
- **Tailwind CSS v4** - Styling
- **TypeScript** - Type safety
- **Basic Authentication** - Password protection

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the [MIT License](LICENSE).
