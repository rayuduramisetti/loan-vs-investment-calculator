import React from 'react';
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

  const getMinimumPayment = (loan) => {
    if (!loan.amount || !loan.loanTerm) return 0;
    const termInMonths = loan.termUnit === 'years' ? loan.loanTerm * 12 : loan.loanTerm;
    return calculateMinimumPayment(loan.amount, loan.interestRate, termInMonths);
  };

  const getAdditionalChargesTotal = (loan) => {
    if (!loan.additionalCharges || loan.additionalCharges.length === 0) return 0;
    return loan.additionalCharges.reduce((sum, charge) => {
      const monthlyAmount = charge.frequency === 'yearly' ? charge.amount / 12 : charge.amount;
      return sum + monthlyAmount;
    }, 0);
  };

  const getTotalPayment = (loan) => {
    return getMinimumPayment(loan) + getAdditionalChargesTotal(loan);
  };

  const addCharge = (loanId) => {
    const loan = loans.find(l => l.id === loanId);
    const newCharges = [...(loan.additionalCharges || []), {
      id: Date.now(),
      amount: 0,
      frequency: 'monthly'
    }];
    onUpdateLoan(loanId, { additionalCharges: newCharges });
  };

  const updateCharge = (loanId, chargeId, updates) => {
    const loan = loans.find(l => l.id === loanId);
    const newCharges = loan.additionalCharges.map(charge =>
      charge.id === chargeId ? { ...charge, ...updates } : charge
    );
    onUpdateLoan(loanId, { additionalCharges: newCharges });
  };

  const removeCharge = (loanId, chargeId) => {
    const loan = loans.find(l => l.id === loanId);
    const newCharges = loan.additionalCharges.filter(charge => charge.id !== chargeId);
    onUpdateLoan(loanId, { additionalCharges: newCharges });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const totalLoanAmount = loans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
  const totalMinimumPayment = loans.reduce((sum, loan) => sum + getMinimumPayment(loan), 0);
  const totalAdditionalCharges = loans.reduce((sum, loan) => sum + getAdditionalChargesTotal(loan), 0);
  const grandTotalPayment = totalMinimumPayment + totalAdditionalCharges;

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
        <React.Fragment key={loan.id}>
        <div className={styles.loanRow}>
          <div className={styles.inputGroup}>
            <input
              type="number"
              className={styles.input}
              value={loan.amount || ''}
              onChange={(e) => onUpdateLoan(loan.id, { amount: Number(e.target.value) || 0 })}
              onFocus={handleFocus}
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
            <div>{formatCurrency(getTotalPayment(loan))}</div>
            {loan.additionalCharges && loan.additionalCharges.length > 0 && (
              <div className={styles.paymentBreakdown}>
                <div className={styles.breakdownItem}>Loan: {formatCurrency(getMinimumPayment(loan))}</div>
                <div className={styles.breakdownItem}>Other: {formatCurrency(getAdditionalChargesTotal(loan))}</div>
              </div>
            )}
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

        {/* Additional Charges Section */}
        <div className={styles.chargesSection}>
          {loan.additionalCharges && loan.additionalCharges.length > 0 && (
            <div className={styles.chargesList}>
              <div className={styles.chargesHeader}>Additional Monthly Charges:</div>
              {loan.additionalCharges.map((charge) => (
                <div key={charge.id} className={styles.chargeRow}>
                  <input
                    type="number"
                    className={styles.chargeInput}
                    value={charge.amount || ''}
                    onChange={(e) => updateCharge(loan.id, charge.id, { amount: Number(e.target.value) || 0 })}
                    onFocus={handleFocus}
                    min="0"
                    step="10"
                    placeholder="Amount"
                  />
                  <div className={styles.chargeFrequency}>
                    <button
                      type="button"
                      className={`${styles.frequencyBtn} ${charge.frequency === 'monthly' ? styles.active : ''}`}
                      onClick={() => updateCharge(loan.id, charge.id, { frequency: 'monthly' })}
                    >
                      M
                    </button>
                    <button
                      type="button"
                      className={`${styles.frequencyBtn} ${charge.frequency === 'yearly' ? styles.active : ''}`}
                      onClick={() => updateCharge(loan.id, charge.id, { frequency: 'yearly' })}
                    >
                      Y
                    </button>
                  </div>
                  <button
                    type="button"
                    className={styles.removeChargeBtn}
                    onClick={() => removeCharge(loan.id, charge.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            className={styles.addChargeButton}
            onClick={() => addCharge(loan.id)}
          >
            + Add Charge
          </button>
        </div>
        </React.Fragment>
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
            <span className={styles.totalLabel}>Total Loan Payment:</span>
            <span className={styles.totalValue}>{formatCurrency(totalMinimumPayment)}/month</span>
          </div>
          {totalAdditionalCharges > 0 && (
            <>
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total Additional Charges:</span>
                <span className={styles.totalValue}>{formatCurrency(totalAdditionalCharges)}/month</span>
              </div>
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Grand Total Payment:</span>
                <span className={styles.totalValue}>{formatCurrency(grandTotalPayment)}/month</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
