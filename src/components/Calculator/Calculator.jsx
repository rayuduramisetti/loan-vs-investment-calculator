import { useCalculator } from '../../hooks/useCalculator';
import { InputCard } from './InputCard';
import { ComparisonChart } from '../Results/ComparisonChart';
import { ResultsCard } from '../Results/ResultsCard';
import styles from './Calculator.module.css';

export function Calculator() {
  const {
    loans,
    investments,
    totalLoanAmount,
    totalMinimumPayment,
    earliestLoanStartDate,
    scenarioAData,
    scenarioBData,
    scenarioCData,
    chartData,
    betterScenario,
    addLoan,
    updateLoan,
    removeLoan,
    addInvestment,
    updateInvestment,
    removeInvestment
  } = useCalculator();

  return (
    <div className={styles.calculator}>
      <InputCard
        loans={loans}
        investments={investments}
        earliestLoanStartDate={earliestLoanStartDate}
        onAddLoan={addLoan}
        onUpdateLoan={updateLoan}
        onRemoveLoan={removeLoan}
        onAddInvestment={addInvestment}
        onUpdateInvestment={updateInvestment}
        onRemoveInvestment={removeInvestment}
      />

      <ComparisonChart chartData={chartData} />

      <ResultsCard
        scenarioAData={scenarioAData}
        scenarioBData={scenarioBData}
        scenarioCData={scenarioCData}
        betterScenario={betterScenario}
      />
    </div>
  );
}
