import styles from './InvestmentList.module.css';

export function InvestmentList({
  investments,
  onUpdateInvestment,
  onRemoveInvestment,
  onAddInvestment,
  earliestLoanStartDate
}) {
  const handleFocus = (e) => {
    e.target.select();
  };

  // Calculate duration in months between two dates
  const getMonthsDuration = (fromDate, toDate) => {
    if (!fromDate || !toDate) return 0;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    return Math.round((end - start) / (1000 * 60 * 60 * 24 * 30.44));
  };

  // Format duration as object with years and months
  const formatDuration = (months) => {
    if (months <= 0) return { years: null, months: '0 m' };
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    return {
      years: years > 0 ? `${years} Y` : null,
      months: remainingMonths > 0 ? `${remainingMonths} m` : null
    };
  };

  // Calculate final value for an investment after compounding
  const calculateFinalValue = (investment) => {
    if (!investment.fromDate || !investment.toDate || !investment.amount || !investment.apr) {
      return 0;
    }

    const totalMonths = getMonthsDuration(investment.fromDate, investment.toDate);
    if (totalMonths <= 0) return investment.amount;

    const monthlyRate = investment.apr / 12 / 100;

    if (investment.type === 'recurring') {
      // For recurring investments, add the amount periodically and compound
      const periodsPerYear = investment.frequency === 'monthly' ? 12 : 1;
      const monthsPerPeriod = investment.frequency === 'monthly' ? 1 : 12;
      const periods = Math.floor(totalMonths / monthsPerPeriod);

      let finalValue = 0;
      for (let i = 0; i < periods; i++) {
        const monthsRemaining = totalMonths - (i * monthsPerPeriod);
        finalValue += investment.amount * Math.pow(1 + monthlyRate, monthsRemaining);
      }
      return finalValue;
    } else {
      // One-time investment
      const finalValue = investment.amount * Math.pow(1 + monthlyRate, totalMonths);
      return finalValue;
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const totalInvestmentAmount = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalFinalValue = investments.reduce((sum, inv) => sum + calculateFinalValue(inv), 0);

  return (
    <div className={styles.investmentList}>
      <div className={styles.header}>
        <span className={styles.headerLabel}>Type</span>
        <span className={styles.headerLabel}>From Date</span>
        <span className={styles.headerLabel}>To Date</span>
        <span className={styles.headerLabel}>Duration</span>
        <span className={styles.headerLabel}>Amount</span>
        <span className={styles.headerLabel}>APR %</span>
        <span className={styles.headerLabel}>Final Value</span>
        <span className={styles.headerLabel}>Action</span>
      </div>

      {investments.map((investment) => (
        <div key={investment.id} className={styles.investmentRow}>
          <div className={styles.inputGroup}>
            <div className={styles.typeWrapper}>
              <select
                className={styles.typeSelect}
                value={investment.type || 'one-time'}
                onChange={(e) => onUpdateInvestment(investment.id, { type: e.target.value })}
              >
                <option value="one-time">One-time</option>
                <option value="recurring">Recurring</option>
              </select>
              {investment.type === 'recurring' && (
                <div className={styles.frequencyToggle}>
                  <button
                    type="button"
                    className={`${styles.frequencyButton} ${investment.frequency === 'monthly' ? styles.active : ''}`}
                    onClick={() => onUpdateInvestment(investment.id, { frequency: 'monthly' })}
                  >
                    M
                  </button>
                  <button
                    type="button"
                    className={`${styles.frequencyButton} ${investment.frequency === 'yearly' ? styles.active : ''}`}
                    onClick={() => onUpdateInvestment(investment.id, { frequency: 'yearly' })}
                  >
                    Y
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <input
              type="date"
              className={styles.input}
              value={investment.fromDate || ''}
              onChange={(e) => onUpdateInvestment(investment.id, { fromDate: e.target.value })}
              onFocus={handleFocus}
              min={earliestLoanStartDate}
            />
          </div>

          <div className={styles.inputGroup}>
            <input
              type="date"
              className={styles.input}
              value={investment.toDate || ''}
              onChange={(e) => onUpdateInvestment(investment.id, { toDate: e.target.value })}
              onFocus={handleFocus}
            />
          </div>

          <div className={styles.duration}>
            {(() => {
              const duration = formatDuration(getMonthsDuration(investment.fromDate, investment.toDate));
              return (
                <>
                  {duration.years && <div>{duration.years}</div>}
                  {duration.months && <div>{duration.months}</div>}
                </>
              );
            })()}
          </div>

          <div className={styles.inputGroup}>
            <input
              type="number"
              className={styles.input}
              value={investment.amount || ''}
              onChange={(e) => onUpdateInvestment(investment.id, { amount: Number(e.target.value) || 0 })}
              onFocus={handleFocus}
              min="0"
              step="1000"
              placeholder="10000"
            />
          </div>

          <div className={styles.inputGroup}>
            <input
              type="number"
              className={styles.input}
              value={investment.apr || ''}
              onChange={(e) => onUpdateInvestment(investment.id, { apr: Number(e.target.value) || 0 })}
              onFocus={handleFocus}
              min="0"
              max="100"
              step="0.1"
              placeholder="7.0"
            />
          </div>

          <div className={styles.finalValue}>
            {formatCurrency(calculateFinalValue(investment))}
          </div>

          <button
            type="button"
            className={styles.removeButton}
            onClick={() => onRemoveInvestment(investment.id)}
            disabled={investments.length === 1}
          >
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        className={styles.addButton}
        onClick={onAddInvestment}
      >
        + Add Investment
      </button>

      {investments.length > 1 && (
        <div className={styles.totalsGrid}>
          <div></div>
          <div className={styles.totalLabel}>Total</div>
          <div></div>
          <div className={styles.totalDuration}>
            {(() => {
              const totalMonths = investments.reduce((sum, inv) => sum + getMonthsDuration(inv.fromDate, inv.toDate), 0);
              const duration = formatDuration(totalMonths);
              return (
                <>
                  {duration.years && <div>{duration.years}</div>}
                  {duration.months && <div>{duration.months}</div>}
                </>
              );
            })()}
          </div>
          <div className={styles.totalAmount}>{formatCurrency(totalInvestmentAmount)}</div>
          <div></div>
          <div className={styles.totalFinalValue}>{formatCurrency(totalFinalValue)}</div>
          <div></div>
        </div>
      )}
    </div>
  );
}
