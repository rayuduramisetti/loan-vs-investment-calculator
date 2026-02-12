import { useReducer, useMemo } from 'react';
import {
  calculateMinimumPayment,
  calculateScenarioA,
  calculateScenarioB,
  calculateScenarioC,
  generateChartData
} from '../utils/loanCalculations';

// Action types
const ADD_LOAN = 'ADD_LOAN';
const UPDATE_LOAN = 'UPDATE_LOAN';
const REMOVE_LOAN = 'REMOVE_LOAN';
const ADD_INVESTMENT = 'ADD_INVESTMENT';
const UPDATE_INVESTMENT = 'UPDATE_INVESTMENT';
const REMOVE_INVESTMENT = 'REMOVE_INVESTMENT';

// Initial state with default values
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getDefaultEndDate = () => {
  const today = new Date();
  today.setFullYear(today.getFullYear() + 30);
  return today.toISOString().split('T')[0];
};

const initialState = {
  loans: [
    { id: 1, amount: 100000, interestRate: 5.5, loanTerm: 30, termUnit: 'years', startDate: getTodayDate() }
  ],
  nextLoanId: 2,
  investments: [
    { id: 1, type: 'one-time', frequency: 'monthly', fromDate: getTodayDate(), toDate: getDefaultEndDate(), amount: 10000, apr: 7.0 }
  ],
  nextInvestmentId: 2
};

// Reducer function
function calculatorReducer(state, action) {
  switch (action.type) {
    case ADD_LOAN:
      return {
        ...state,
        loans: [...state.loans, {
          id: state.nextLoanId,
          amount: 0,
          interestRate: 5.5,
          loanTerm: 30,
          termUnit: 'years',
          startDate: getTodayDate()
        }],
        nextLoanId: state.nextLoanId + 1
      };
    case UPDATE_LOAN:
      return {
        ...state,
        loans: state.loans.map(loan =>
          loan.id === action.payload.id
            ? { ...loan, ...action.payload.updates }
            : loan
        )
      };
    case REMOVE_LOAN:
      return {
        ...state,
        loans: state.loans.filter(loan => loan.id !== action.payload)
      };
    case ADD_INVESTMENT:
      // Use earliest loan start date as reference
      const earliestDate = state.loans.length > 0
        ? state.loans.reduce((earliest, loan) =>
            new Date(loan.startDate) < new Date(earliest) ? loan.startDate : earliest,
            state.loans[0].startDate
          )
        : getTodayDate();

      const newEndDate = new Date(earliestDate);
      newEndDate.setFullYear(newEndDate.getFullYear() + 30);
      return {
        ...state,
        investments: [...state.investments, {
          id: state.nextInvestmentId,
          type: 'one-time',
          frequency: 'monthly',
          fromDate: earliestDate,  // Always use earliest loan start date
          toDate: newEndDate.toISOString().split('T')[0],
          amount: 0,
          apr: 7.0
        }],
        nextInvestmentId: state.nextInvestmentId + 1
      };
    case UPDATE_INVESTMENT:
      return {
        ...state,
        investments: state.investments.map(inv =>
          inv.id === action.payload.id
            ? { ...inv, ...action.payload.updates }
            : inv
        )
      };
    case REMOVE_INVESTMENT:
      return {
        ...state,
        investments: state.investments.filter(inv => inv.id !== action.payload)
      };
    default:
      return state;
  }
}

/**
 * Custom hook for calculator state management
 *
 * @returns {object} State, computed values, and action dispatchers
 */
export function useCalculator() {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);

  // Helper function to calculate months between two dates
  const getMonthsDifference = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.round((end - start) / (1000 * 60 * 60 * 24 * 30.44)); // Average days per month
  };

  // Calculate aggregate loan values
  const aggregateLoanData = useMemo(() => {
    const totalAmount = state.loans.reduce((sum, loan) => sum + (loan.amount || 0), 0);

    // Calculate total minimum payment across all loans
    const totalMinimumPayment = state.loans.reduce((sum, loan) => {
      const termInMonths = loan.termUnit === 'years' ? loan.loanTerm * 12 : loan.loanTerm;
      const payment = calculateMinimumPayment(loan.amount, loan.interestRate, termInMonths);
      return sum + payment;
    }, 0);

    // Use the earliest loan start date as reference
    const earliestStartDate = state.loans.length > 0
      ? state.loans.reduce((earliest, loan) =>
          new Date(loan.startDate) < new Date(earliest) ? loan.startDate : earliest,
          state.loans[0].startDate
        )
      : getTodayDate();

    return {
      totalAmount,
      totalMinimumPayment,
      earliestStartDate
    };
  }, [state.loans]);

  // Calculate weighted interest rate and max term
  const loanMetrics = useMemo(() => {
    const weightedInterestRate = state.loans.reduce((sum, loan) => {
      return sum + (loan.interestRate * loan.amount);
    }, 0) / (aggregateLoanData.totalAmount || 1);

    const maxTermMonths = state.loans.reduce((max, loan) => {
      const termInMonths = loan.termUnit === 'years' ? loan.loanTerm * 12 : loan.loanTerm;
      return Math.max(max, termInMonths);
    }, 0);

    return { weightedInterestRate, maxTermMonths };
  }, [state.loans, aggregateLoanData.totalAmount]);

  // Calculate Scenario A: Minimum payment + save investment amounts in bank
  const scenarioAData = useMemo(() => {
    if (aggregateLoanData.totalMinimumPayment <= 0) return null;

    // Convert date-based investments to month-based
    const investmentsWithMonths = state.investments.map(inv => ({
      ...inv,
      fromMonth: getMonthsDifference(aggregateLoanData.earliestStartDate, inv.fromDate),
      toMonth: getMonthsDifference(aggregateLoanData.earliestStartDate, inv.toDate)
    }));

    return calculateScenarioA(
      aggregateLoanData.totalAmount,
      loanMetrics.weightedInterestRate || 0,
      aggregateLoanData.totalMinimumPayment,
      investmentsWithMonths,
      0, // Savings rate (0% for now)
      loanMetrics.maxTermMonths
    );
  }, [state.loans, state.investments, aggregateLoanData, loanMetrics]);

  // Calculate Scenario B: Minimum payment + investment amounts to loan
  const scenarioBData = useMemo(() => {
    if (aggregateLoanData.totalMinimumPayment <= 0) return null;

    // Convert date-based investments to month-based
    const investmentsWithMonths = state.investments.map(inv => ({
      ...inv,
      fromMonth: getMonthsDifference(aggregateLoanData.earliestStartDate, inv.fromDate),
      toMonth: getMonthsDifference(aggregateLoanData.earliestStartDate, inv.toDate)
    }));

    return calculateScenarioB(
      aggregateLoanData.totalAmount,
      loanMetrics.weightedInterestRate || 0,
      aggregateLoanData.totalMinimumPayment,
      investmentsWithMonths,
      loanMetrics.maxTermMonths
    );
  }, [state.loans, state.investments, aggregateLoanData, loanMetrics]);

  // Calculate Scenario C: Minimum payment + invest
  const scenarioCData = useMemo(() => {
    if (aggregateLoanData.totalMinimumPayment <= 0) return null;

    // Convert date-based investments to month-based for calculation
    const investmentsWithMonths = state.investments.map(inv => ({
      ...inv,
      fromMonth: getMonthsDifference(aggregateLoanData.earliestStartDate, inv.fromDate),
      toMonth: getMonthsDifference(aggregateLoanData.earliestStartDate, inv.toDate)
    }));

    return calculateScenarioC(
      aggregateLoanData.totalAmount,
      loanMetrics.weightedInterestRate || 0,
      investmentsWithMonths,
      aggregateLoanData.totalMinimumPayment,
      loanMetrics.maxTermMonths
    );
  }, [
    state.loans,
    state.investments,
    aggregateLoanData,
    loanMetrics
  ]);

  // Generate chart data
  const chartData = useMemo(() => {
    if (!scenarioAData || !scenarioBData || !scenarioCData) return [];
    return generateChartData(scenarioAData, scenarioBData, scenarioCData);
  }, [scenarioAData, scenarioBData, scenarioCData]);

  // Determine which scenario is better
  const betterScenario = useMemo(() => {
    if (!scenarioAData || !scenarioBData || !scenarioCData) return null;

    // Calculate final net positions
    const netA = scenarioAData.savingsBalance - scenarioAData.totalInterest;
    const netB = -scenarioBData.totalInterest; // No savings, just interest saved
    const netC = scenarioCData.investmentValue - scenarioCData.totalInterest;

    if (netC >= netA && netC >= netB) return 'C';
    if (netB >= netA && netB >= netC) return 'B';
    return 'A';
  }, [scenarioAData, scenarioBData, scenarioCData]);

  // Action dispatchers
  const addLoan = () => {
    dispatch({ type: ADD_LOAN });
  };

  const updateLoan = (id, updates) => {
    dispatch({ type: UPDATE_LOAN, payload: { id, updates } });
  };

  const removeLoan = (id) => {
    dispatch({ type: REMOVE_LOAN, payload: id });
  };

  const addInvestment = () => {
    dispatch({ type: ADD_INVESTMENT });
  };

  const updateInvestment = (id, updates) => {
    dispatch({ type: UPDATE_INVESTMENT, payload: { id, updates } });
  };

  const removeInvestment = (id) => {
    dispatch({ type: REMOVE_INVESTMENT, payload: id });
  };

  return {
    // State
    loans: state.loans,
    investments: state.investments,

    // Computed values
    totalLoanAmount: aggregateLoanData.totalAmount,
    totalMinimumPayment: aggregateLoanData.totalMinimumPayment,
    earliestLoanStartDate: aggregateLoanData.earliestStartDate,
    scenarioAData,
    scenarioBData,
    scenarioCData,
    chartData,
    betterScenario,

    // Actions
    addLoan,
    updateLoan,
    removeLoan,
    addInvestment,
    updateInvestment,
    removeInvestment
  };
}
