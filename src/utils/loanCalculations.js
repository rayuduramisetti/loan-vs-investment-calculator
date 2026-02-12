/**
 * Calculate the minimum monthly payment for a loan using the standard amortization formula
 *
 * Formula: M = P × [r(1 + r)^n] / [(1 + r)^n - 1]
 *
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate as percentage (e.g., 5.5 for 5.5%)
 * @param {number} termMonths - Loan term in months
 * @returns {number} Monthly payment amount
 */
export function calculateMinimumPayment(principal, annualRate, termMonths) {
  if (principal <= 0 || termMonths <= 0) return 0;

  // Handle zero interest rate
  if (annualRate === 0) {
    return principal / termMonths;
  }

  const monthlyRate = annualRate / 12 / 100;
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, termMonths);
  const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;

  return principal * (numerator / denominator);
}

/**
 * Calculate Scenario A: Minimum payment + save investment amounts in bank
 *
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual loan interest rate as percentage
 * @param {number} minimumPayment - Calculated minimum monthly payment
 * @param {Array} investments - Array of {fromMonth, toMonth, amount, apr} for saving
 * @param {number} savingsRate - Annual interest rate for savings (default 0%)
 * @param {number} maxMonths - Maximum months to calculate (safety limit)
 * @returns {object} Scenario A data with totals and monthly breakdown
 */
export function calculateScenarioA(principal, annualRate, minimumPayment, investments = [], savingsRate = 0, maxMonths = 360) {
  const monthlyLoanRate = annualRate / 12 / 100;
  const monthlySavingsRate = savingsRate / 12 / 100;
  let loanBalance = principal;
  let savingsBalance = 0;
  let totalInterest = 0;
  let totalPaid = 0;
  let totalSaved = 0;
  let month = 0;

  const monthlyData = [];

  while (loanBalance > 0.01 && month < maxMonths) {
    const interestPayment = loanBalance * monthlyLoanRate;
    const principalPayment = Math.min(minimumPayment - interestPayment, loanBalance);

    if (principalPayment <= 0) {
      break;
    }

    loanBalance -= principalPayment;
    totalInterest += interestPayment;
    totalPaid += minimumPayment;

    // Add investment amounts to savings
    let monthlyDeposit = 0;
    investments.forEach(inv => {
      const invType = inv.type || 'one-time';
      const invFrequency = inv.frequency || 'monthly';

      if (invType === 'recurring') {
        // For recurring investments, check if within date range and at contribution interval
        if (month >= inv.fromMonth && month <= inv.toMonth) {
          const monthsPerContribution = invFrequency === 'monthly' ? 1 : 12;
          if (month === inv.fromMonth || (month > inv.fromMonth && (month - inv.fromMonth) % monthsPerContribution === 0)) {
            monthlyDeposit += inv.amount;
            totalSaved += inv.amount;
          }
        }
      } else {
        // One-time investment - only apply at fromMonth
        if (month === inv.fromMonth) {
          monthlyDeposit += inv.amount;
          totalSaved += inv.amount;
        }
      }
    });

    // Save with interest
    savingsBalance = (savingsBalance + monthlyDeposit) * (1 + monthlySavingsRate);

    month++;

    monthlyData.push({
      month,
      loanBalance: Math.max(0, loanBalance),
      savingsBalance,
      interestPaid: interestPayment,
      principalPaid: principalPayment,
      saved: monthlyDeposit
    });
  }

  const loanPayoffMonth = month;

  // After loan paid off, savings continue to accumulate interest
  while (month < maxMonths) {
    let monthlyDeposit = 0;
    investments.forEach(inv => {
      const invType = inv.type || 'one-time';
      const invFrequency = inv.frequency || 'monthly';

      if (invType === 'recurring') {
        // For recurring investments, check if within date range and at contribution interval
        if (month >= inv.fromMonth && month <= inv.toMonth) {
          const monthsPerContribution = invFrequency === 'monthly' ? 1 : 12;
          if (month === inv.fromMonth || (month > inv.fromMonth && (month - inv.fromMonth) % monthsPerContribution === 0)) {
            monthlyDeposit += inv.amount;
            totalSaved += inv.amount;
          }
        }
      } else {
        // One-time investment - only apply at fromMonth
        if (month === inv.fromMonth) {
          monthlyDeposit += inv.amount;
          totalSaved += inv.amount;
        }
      }
    });

    savingsBalance = (savingsBalance + monthlyDeposit) * (1 + monthlySavingsRate);
    month++;

    monthlyData.push({
      month,
      loanBalance: 0,
      savingsBalance,
      interestPaid: 0,
      principalPaid: 0,
      saved: monthlyDeposit
    });
  }

  return {
    totalPaid,
    totalInterest,
    savingsBalance,
    totalSaved,
    monthsToPayoff: loanPayoffMonth,
    monthlyData
  };
}

/**
 * Calculate Scenario B: Pay minimum + investment amounts toward loan principal
 *
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual loan interest rate as percentage
 * @param {number} minimumPayment - Calculated minimum monthly payment
 * @param {Array} investments - Array of {fromMonth, toMonth, amount, apr} for loan paydown
 * @param {number} maxMonths - Maximum months to calculate
 * @returns {object} Scenario B data with totals and monthly breakdown
 */
export function calculateScenarioB(principal, annualRate, minimumPayment, investments = [], maxMonths = 360) {
  const monthlyLoanRate = annualRate / 12 / 100;
  let loanBalance = principal;
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;

  const monthlyData = [];

  while (loanBalance > 0.01 && month < maxMonths) {
    const interestPayment = loanBalance * monthlyLoanRate;
    const principalPayment = Math.min(minimumPayment - interestPayment, loanBalance);

    if (principalPayment <= 0) {
      break;
    }

    // Apply investment amounts to loan principal
    let extraPayment = 0;
    investments.forEach(inv => {
      const invType = inv.type || 'one-time';
      const invFrequency = inv.frequency || 'monthly';

      if (invType === 'recurring') {
        // For recurring investments, check if within date range and at contribution interval
        if (month >= inv.fromMonth && month <= inv.toMonth) {
          const monthsPerContribution = invFrequency === 'monthly' ? 1 : 12;
          if (month === inv.fromMonth || (month > inv.fromMonth && (month - inv.fromMonth) % monthsPerContribution === 0)) {
            extraPayment += Math.min(inv.amount, loanBalance - principalPayment);
          }
        }
      } else {
        // One-time investment - only apply at fromMonth
        if (month === inv.fromMonth) {
          extraPayment += Math.min(inv.amount, loanBalance - principalPayment);
        }
      }
    });

    loanBalance -= (principalPayment + extraPayment);
    totalInterest += interestPayment;
    totalPaid += minimumPayment + extraPayment;

    month++;

    monthlyData.push({
      month,
      loanBalance: Math.max(0, loanBalance),
      interestPaid: interestPayment,
      principalPaid: principalPayment,
      extraPaid: extraPayment
    });
  }

  return {
    totalPaid,
    totalInterest,
    monthsToPayoff: month,
    monthlyData
  };
}

/**
 * Calculate Scenario C: Pay minimum on loan + invest with date ranges and individual APRs
 *
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual loan interest rate as percentage
 * @param {Array} investments - Array of {fromMonth, toMonth, amount, apr} investments
 * @param {number} minimumPayment - Calculated minimum payment
 * @param {number} maxMonths - Maximum months to calculate
 * @returns {object} Scenario C data with totals and monthly breakdown
 */
export function calculateScenarioC(
  principal,
  annualRate,
  investments,
  minimumPayment,
  maxMonths = 360
) {
  const monthlyLoanRate = annualRate / 12 / 100;

  let loanBalance = principal;
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;

  const monthlyData = [];

  // Track each investment separately with its own APR and compounding
  const investmentTracking = investments.map(inv => {
    const invType = inv.type || 'one-time';
    const invFrequency = inv.frequency || 'monthly';
    return {
      ...inv,
      type: invType,
      frequency: invFrequency,
      currentValue: 0,
      initialAmount: inv.amount,
      monthlyRate: (inv.apr || 0) / 12 / 100,
      monthsPerContribution: invType === 'recurring' ? (invFrequency === 'monthly' ? 1 : 12) : 0
    };
  });

  // Pay minimum on loan while investments grow
  while (loanBalance > 0.01 && month < maxMonths) {
    const interestPayment = loanBalance * monthlyLoanRate;
    const principalPayment = Math.min(minimumPayment - interestPayment, loanBalance);

    loanBalance -= principalPayment;
    totalInterest += interestPayment;
    totalPaid += minimumPayment;

    let monthlyInvested = 0;

    // Process each investment
    investmentTracking.forEach(inv => {
      if (month >= inv.fromMonth && month <= inv.toMonth) {
        if (inv.type === 'recurring') {
          // For recurring, add contribution at regular intervals
          if (month === inv.fromMonth || (month > inv.fromMonth && (month - inv.fromMonth) % inv.monthsPerContribution === 0)) {
            inv.currentValue += inv.amount;
            monthlyInvested += inv.amount;
          }
          // Always compound if within period
          inv.currentValue = inv.currentValue * (1 + inv.monthlyRate);
        } else {
          // One-time investment
          if (month === inv.fromMonth) {
            inv.currentValue = inv.amount;
            monthlyInvested += inv.amount;
          } else {
            // Compound existing value
            inv.currentValue = inv.currentValue * (1 + inv.monthlyRate);
          }
        }
      }
    });

    const totalInvestmentValue = investmentTracking.reduce((sum, inv) => sum + inv.currentValue, 0);

    month++;

    monthlyData.push({
      month,
      loanBalance: Math.max(0, loanBalance),
      investmentValue: totalInvestmentValue,
      interestPaid: interestPayment,
      principalPaid: principalPayment,
      invested: monthlyInvested
    });
  }

  const loanPayoffMonth = month;

  // After loan is paid off, investments continue to grow
  while (month < maxMonths) {
    let monthlyInvested = 0;

    investmentTracking.forEach(inv => {
      if (month >= inv.fromMonth && month <= inv.toMonth) {
        if (inv.type === 'recurring') {
          // For recurring, add contribution at regular intervals
          if (month === inv.fromMonth || (month > inv.fromMonth && (month - inv.fromMonth) % inv.monthsPerContribution === 0)) {
            inv.currentValue += inv.amount;
            monthlyInvested += inv.amount;
          }
          // Always compound if within period
          inv.currentValue = inv.currentValue * (1 + inv.monthlyRate);
        } else {
          // One-time investment
          if (month === inv.fromMonth) {
            inv.currentValue = inv.amount;
            monthlyInvested += inv.amount;
          } else {
            // Compound existing value
            inv.currentValue = inv.currentValue * (1 + inv.monthlyRate);
          }
        }
      }
    });

    const totalInvestmentValue = investmentTracking.reduce((sum, inv) => sum + inv.currentValue, 0);

    month++;

    monthlyData.push({
      month,
      loanBalance: 0,
      investmentValue: totalInvestmentValue,
      interestPaid: 0,
      principalPaid: 0,
      invested: monthlyInvested
    });
  }

  const finalInvestmentValue = investmentTracking.reduce((sum, inv) => sum + inv.currentValue, 0);

  return {
    totalPaid,
    totalInterest,
    investmentValue: finalInvestmentValue,
    netPosition: finalInvestmentValue,
    monthsToPayoff: loanPayoffMonth,
    monthlyData,
    investmentDetails: investmentTracking.map(inv => ({
      amount: inv.initialAmount,
      fromMonth: inv.fromMonth,
      toMonth: inv.toMonth,
      finalValue: inv.currentValue,
      profit: inv.currentValue - inv.initialAmount
    }))
  };
}

/**
 * Generate chart data combining all three scenarios
 *
 * @param {object} scenarioAData - Data from Scenario A
 * @param {object} scenarioBData - Data from Scenario B
 * @param {object} scenarioCData - Data from Scenario C
 * @returns {Array} Chart data for Recharts
 */
export function generateChartData(scenarioAData, scenarioBData, scenarioCData) {
  const maxLength = Math.max(
    scenarioAData.monthlyData.length,
    scenarioBData.monthlyData.length,
    scenarioCData.monthlyData.length
  );

  return Array.from({ length: maxLength }, (_, i) => ({
    month: i + 1,
    scenarioA_loanBalance: scenarioAData.monthlyData[i]?.loanBalance || 0,
    scenarioA_savings: scenarioAData.monthlyData[i]?.savingsBalance || 0,
    scenarioB_loanBalance: scenarioBData.monthlyData[i]?.loanBalance || 0,
    scenarioC_loanBalance: scenarioCData.monthlyData[i]?.loanBalance || 0,
    scenarioC_investment: scenarioCData.monthlyData[i]?.investmentValue || 0
  }));
}
