import { Card } from '../Layout/Card';
import { LoanList } from './LoanList';
import { InvestmentList } from './InvestmentList';
import styles from './InputCard.module.css';

export function InputCard({
  loans,
  investments,
  earliestLoanStartDate,
  onAddLoan,
  onUpdateLoan,
  onRemoveLoan,
  onAddInvestment,
  onUpdateInvestment,
  onRemoveInvestment
}) {
  return (
    <div className={styles.sectionsContainer}>
      <Card>
        <h2 className={styles.sectionTitle}>Loan Details</h2>

        <LoanList
          loans={loans}
          onUpdateLoan={onUpdateLoan}
          onRemoveLoan={onRemoveLoan}
          onAddLoan={onAddLoan}
        />
      </Card>

      <Card>
        <h2 className={styles.sectionTitle}>Investment Details</h2>

        <InvestmentList
          investments={investments}
          earliestLoanStartDate={earliestLoanStartDate}
          onUpdateInvestment={onUpdateInvestment}
          onRemoveInvestment={onRemoveInvestment}
          onAddInvestment={onAddInvestment}
        />
      </Card>
    </div>
  );
}
