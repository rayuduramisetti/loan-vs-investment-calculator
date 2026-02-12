import { calculateMinimumPayment } from '../../utils/loanCalculations';
import styles from './LoanList.module.css';

export function LoanList({
  loans,
  onUpdateLoan,
  onRemoveLoan,
  onAddLoan
}) {
  const handleFocus = (e) => {
    e.target.select();
  };

  const handlePaste = (e, loanId, field) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    // Remove commas and parse as number
    const cleanedValue = pastedText.replace(/,/g, '');
    const numValue = parseFloat(cleanedValue);

    if (!isNaN(numValue)) {
      onUpdateLoan(loanId, { [field]: numValue });
    }
  };

  const getMinimumPayment = (loan) => {
    if (!loan.amount || !loan.loanTerm) return 0;
    const termInMonths = loan.termUnit === 'years' ? loan.loanTerm * 12 : loan.loanTerm;
    return calculateMinimumPayment(loan.amount, loan.interestRate, termInMonths);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const totalLoanAmount = loans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
  const totalMinimumPayment = loans.reduce((sum, loan) => sum + getMinimumPayment(loan), 0);

  return (
    <div className={styles.loanList}>
      <div className={styles.header}>
        <span className={styles.headerLabel}>Amount</span>
        <span className={styles.headerLabel}>Interest %</span>
        <span className={styles.headerLabel}>Loan Term</span>
        <span className={styles.headerLabel}>Start Date</span>
        <span className={styles.headerLabel}>Min Payment/mo</span>
        <span className={styles.headerLabel}>Action</span>
      </div>

      {loans.map((loan) => (
        <div key={loan.id} className={styles.loanRow}>
          <div className={styles.inputGroup}>
            <input
              type="number"
              className={styles.input}
              value={loan.amount || ''}
              onChange={(e) => onUpdateLoan(loan.id, { amount: Number(e.target.value) || 0 })}
              onFocus={handleFocus}
              onPaste={(e) => handlePaste(e, loan.id, 'amount')}
              min="0"
              step="1000"
              placeholder="100000"
            />
          </div>

          <div className={styles.inputGroup}>
            <input
              type="number"
              className={styles.input}
              value={loan.interestRate || ''}
              onChange={(e) => onUpdateLoan(loan.id, { interestRate: Number(e.target.value) || 0 })}
              onFocus={handleFocus}
              onPaste={(e) => handlePaste(e, loan.id, 'interestRate')}
              min="0"
              max="100"
              step="0.1"
              placeholder="5.5"
            />
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.termWrapper}>
              <input
                type="number"
                className={styles.termInput}
                value={loan.loanTerm || ''}
                onChange={(e) => onUpdateLoan(loan.id, { loanTerm: Number(e.target.value) || 0 })}
                onFocus={handleFocus}
                min="1"
                step="1"
                placeholder="30"
              />
              <div className={styles.termToggle}>
                <button
                  type="button"
                  className={`${styles.termButton} ${loan.termUnit === 'years' ? styles.active : ''}`}
                  onClick={() => onUpdateLoan(loan.id, { termUnit: 'years' })}
                >
                  Y
                </button>
                <button
                  type="button"
                  className={`${styles.termButton} ${loan.termUnit === 'months' ? styles.active : ''}`}
                  onClick={() => onUpdateLoan(loan.id, { termUnit: 'months' })}
                >
                  M
                </button>
              </div>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <input
              type="date"
              className={styles.input}
              value={loan.startDate || ''}
              onChange={(e) => onUpdateLoan(loan.id, { startDate: e.target.value })}
            />
          </div>

          <div className={styles.minPayment}>
            {formatCurrency(getMinimumPayment(loan))}
          </div>

          <button
            type="button"
            className={styles.removeButton}
            onClick={() => onRemoveLoan(loan.id)}
            disabled={loans.length === 1}
          >
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        className={styles.addButton}
        onClick={onAddLoan}
      >
        + Add Loan
      </button>

      {loans.length > 1 && (
        <div className={styles.totalsSection}>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total Loan Amount:</span>
            <span className={styles.totalValue}>{formatCurrency(totalLoanAmount)}</span>
          </div>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total Minimum Payment:</span>
            <span className={styles.totalValue}>{formatCurrency(totalMinimumPayment)}/month</span>
          </div>
        </div>
      )}
    </div>
  );
}
