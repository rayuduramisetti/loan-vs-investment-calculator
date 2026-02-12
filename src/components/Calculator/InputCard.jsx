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

        <div className={styles.investmentSection}>
          <div className={styles.investmentsHeader}>
            <h3 className={styles.subsectionTitle}>Investments</h3>
            <p className={styles.subsectionDesc}>
              Add lump sum amounts available at specific dates. We'll compare three scenarios: save it in bank, use it to pay down the loan, or invest it at the specified APR.
            </p>
          </div>

          <InvestmentList
            investments={investments}
            earliestLoanStartDate={earliestLoanStartDate}
            onUpdateInvestment={onUpdateInvestment}
            onRemoveInvestment={onRemoveInvestment}
            onAddInvestment={onAddInvestment}
          />
        </div>
      </Card>
    </div>
  );
}
