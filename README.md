# Loan vs Investment Calculator

A beautiful React SPA that helps you decide whether to invest extra money or just pay the minimum on your loan. Compare two financial scenarios side by side with interactive charts and detailed metrics.

## Features

- **Interactive Calculator**: Input your loan details and see instant results
- **Visual Comparison**: Beautiful area charts powered by Recharts showing loan balance and investment growth over time
- **Two Scenarios**:
  - **Scenario A**: Pay only the minimum monthly payment
  - **Scenario B**: Pay minimum + invest the extra amount at a fixed return rate
- **Detailed Metrics**: Total paid, total interest, investment value, net position, and payoff timeline
- **Pastel Design**: Clean, minimalist UI inspired by modern SaaS applications
- **Monospace Numbers**: Uses Inconsolata font for all numerical values for better readability
- **Responsive**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Recharts** - Charting library for data visualization
- **CSS Modules** - Scoped styling
- **Inconsolata** - Google Font for monospace numbers

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd loan-vs-investment-calculator
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

1. **Enter Loan Details**:
   - Loan Amount: The principal amount you're borrowing
   - Interest Rate: Annual percentage rate (APR)
   - Loan Term: Duration in years or months
   - Monthly Payment: What you can afford to pay each month
   - Investment Return: Expected annual return rate on investments

2. **View Results**:
   - The calculator shows the minimum required payment
   - If your monthly payment exceeds the minimum, the extra amount goes to investments in Scenario B
   - Compare both scenarios side by side
   - See a visual chart of how both scenarios play out over time

3. **Make an Informed Decision**:
   - The recommendation card shows which scenario is financially better
   - Consider the net benefit along with your risk tolerance and liquidity needs

## Example

**Test Case**: $100,000 loan at 5.5% APR for 30 years
- Minimum Payment: $567.79/month
- If you can pay $600/month:
  - Extra $32.21/month goes to investments
  - At 7% annual return, you'll have $39,525.71 in investments after 30 years
  - Net benefit: $39,525.71 better than just paying the minimum

## Project Structure

```
src/
├── components/
│   ├── Calculator/          # Main calculator component
│   ├── Results/             # Results display and charts
│   └── Layout/              # Reusable layout components
├── utils/
│   ├── loanCalculations.js  # Core calculation logic
│   └── formatters.js        # Number formatting utilities
├── hooks/
│   └── useCalculator.js     # State management hook
├── constants/
│   └── colors.js            # Pastel color palette
└── App.jsx                  # Root component
```

## Financial Calculations

The calculator uses standard financial formulas:

### Minimum Monthly Payment
```
M = P × [r(1 + r)^n] / [(1 + r)^n - 1]

Where:
M = Monthly payment
P = Principal (loan amount)
r = Monthly interest rate (APR / 12 / 100)
n = Total number of payments
```

### Investment Growth
```
Value = (Value + MonthlyContribution) × (1 + MonthlyRate)
```

Contributions are compounded monthly at the specified investment return rate.

## Deployment

This app can be deployed to:

- **Vercel**: Automatic deployments with zero configuration
- **Netlify**: Drag-and-drop deployment or Git integration
- **GitHub Pages**: Free hosting for static sites
- **AWS S3 + CloudFront**: Production-grade hosting

## License

MIT

## Acknowledgments

- Design inspired by [TrustMRR](https://trustmrr.com)
- Built with [React](https://react.dev/) and [Vite](https://vitejs.dev/)
- Charts powered by [Recharts](https://recharts.org/)
- Font: [Inconsolata](https://fonts.google.com/specimen/Inconsolata) by Google Fonts
