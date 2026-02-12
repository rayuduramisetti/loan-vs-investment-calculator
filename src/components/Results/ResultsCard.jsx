import { Card } from '../Layout/Card';
import { formatCurrency, formatMonths } from '../../utils/formatters';
import styles from './ResultsCard.module.css';

export function ResultsCard({ scenarioAData, scenarioBData, scenarioCData, betterScenario }) {
  if (!scenarioAData || !scenarioBData || !scenarioCData) {
    return null;
  }

  const netA = scenarioAData.savingsBalance - scenarioAData.totalInterest;
  const netB = -scenarioBData.totalInterest; // Interest saved by paying off faster
  const netC = scenarioCData.investmentValue - scenarioCData.totalInterest;

  return (
    <div className={styles.container}>
      <div className={styles.scenariosGrid}>
        <Card className={`${styles.scenarioCard} ${betterScenario === 'A' ? styles.better : ''}`}>
          <div className={styles.scenarioHeader}>
            <h3 className={styles.scenarioTitle}>
              Scenario A {betterScenario === 'A' && <span className={styles.badge}>Best</span>}
            </h3>
            <p className={styles.scenarioDesc}>Minimum + Save Rest</p>
          </div>

          <div className={styles.metrics}>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Total Paid</span>
              <span className={styles.metricValue}>
                {formatCurrency(scenarioAData.totalPaid)}
              </span>
            </div>

            <div className={styles.metric}>
              <span className={styles.metricLabel}>Total Interest</span>
              <span className={styles.metricValue}>
                {formatCurrency(scenarioAData.totalInterest)}
              </span>
            </div>

            <div className={styles.metric}>
              <span className={styles.metricLabel}>Time to Pay Off</span>
              <span className={styles.metricValue}>
                {formatMonths(scenarioAData.monthsToPayoff)}
              </span>
            </div>

            <div className={styles.metric}>
              <span className={styles.metricLabel}>Final Value</span>
              <span className={`${styles.metricValue} ${styles.positive}`}>
                {formatCurrency(scenarioAData.savingsBalance)}
              </span>
            </div>

            <div className={styles.metric}>
              <span className={styles.metricLabel}>Net Position</span>
              <span className={`${styles.metricValue} ${netA > 0 ? styles.positive : styles.negative}`}>
                {formatCurrency(netA)}
              </span>
            </div>
          </div>
        </Card>

        <Card className={`${styles.scenarioCard} ${betterScenario === 'B' ? styles.better : ''}`}>
          <div className={styles.scenarioHeader}>
            <h3 className={styles.scenarioTitle}>
              Scenario B {betterScenario === 'B' && <span className={styles.badge}>Best</span>}
            </h3>
            <p className={styles.scenarioDesc}>Minimum + Extra to Loan</p>
          </div>

          <div className={styles.metrics}>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Total Paid</span>
              <span className={styles.metricValue}>
                {formatCurrency(scenarioBData.totalPaid)}
              </span>
            </div>

            <div className={styles.metric}>
              <span className={styles.metricLabel}>Total Interest</span>
              <span className={styles.metricValue}>
                {formatCurrency(scenarioBData.totalInterest)}
              </span>
            </div>

            <div className={styles.metric}>
              <span className={styles.metricLabel}>Time to Pay Off</span>
              <span className={styles.metricValue}>
                {formatMonths(scenarioBData.monthsToPayoff)}
              </span>
            </div>

            <div className={styles.metric}>
              <span className={styles.metricLabel}>Final Value</span>
              <span className={styles.metricValue}>
                {formatCurrency(0)}
              </span>
            </div>

            <div className={styles.metric}>
              <span className={styles.metricLabel}>Net Position</span>
              <span className={`${styles.metricValue} ${netB > 0 ? styles.positive : styles.negative}`}>
                {formatCurrency(netB)}
              </span>
            </div>
          </div>
        </Card>

        <Card className={`${styles.scenarioCard} ${betterScenario === 'C' ? styles.better : ''}`}>
          <div className={styles.scenarioHeader}>
            <h3 className={styles.scenarioTitle}>
              Scenario C {betterScenario === 'C' && <span className={styles.badge}>Best</span>}
            </h3>
            <p className={styles.scenarioDesc}>Minimum + Invest</p>
          </div>

          <div className={styles.metrics}>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Total Paid</span>
              <span className={styles.metricValue}>
                {formatCurrency(scenarioCData.totalPaid)}
              </span>
            </div>

            <div className={styles.metric}>
              <span className={styles.metricLabel}>Total Interest</span>
              <span className={styles.metricValue}>
                {formatCurrency(scenarioCData.totalInterest)}
              </span>
            </div>

            <div className={styles.metric}>
              <span className={styles.metricLabel}>Time to Pay Off</span>
              <span className={styles.metricValue}>
                {formatMonths(scenarioCData.monthsToPayoff)}
              </span>
            </div>

            <div className={styles.metric}>
              <span className={styles.metricLabel}>Final Value</span>
              <span className={`${styles.metricValue} ${styles.positive}`}>
                {formatCurrency(scenarioCData.investmentValue)}
              </span>
            </div>

            <div className={styles.metric}>
              <span className={styles.metricLabel}>Net Position</span>
              <span className={`${styles.metricValue} ${netC > 0 ? styles.positive : styles.negative}`}>
                {formatCurrency(netC)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Card className={styles.recommendation}>
        {betterScenario === 'C' && netC > Math.max(netA, netB) + 1000 ? (
          <>
            <h3 className={styles.recommendationTitle}>Scenario C is Best!</h3>
            <p className={styles.recommendationText}>
              Investing your extra money gives you the best outcome with a net position of{' '}
              <strong className={styles.highlight}>{formatCurrency(netC)}</strong>.
              You'll be <strong className={styles.highlight}>{formatCurrency(netC - Math.max(netA, netB))}</strong> better off than the next best option.
            </p>
          </>
        ) : betterScenario === 'B' && netB > Math.max(netA, netC) ? (
          <>
            <h3 className={styles.recommendationTitle}>Scenario B is Best!</h3>
            <p className={styles.recommendationText}>
              Paying down your loan faster saves you{' '}
              <strong className={styles.highlight}>{formatCurrency(scenarioAData.totalInterest - scenarioBData.totalInterest)}</strong> in interest
              and pays off your loan {formatMonths(scenarioAData.monthsToPayoff - scenarioBData.monthsToPayoff)} earlier.
            </p>
          </>
        ) : betterScenario === 'A' ? (
          <>
            <h3 className={styles.recommendationTitle}>Scenario A is Best!</h3>
            <p className={styles.recommendationText}>
              Saving your extra money in a safe account gives you the best net position of{' '}
              <strong className={styles.highlight}>{formatCurrency(netA)}</strong> while maintaining maximum flexibility.
            </p>
          </>
        ) : (
          <>
            <h3 className={styles.recommendationTitle}>Results Are Close</h3>
            <p className={styles.recommendationText}>
              The scenarios have similar outcomes. Consider factors like risk tolerance, liquidity needs, and financial goals when choosing.
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
