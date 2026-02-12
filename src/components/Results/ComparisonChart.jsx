import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card } from '../Layout/Card';
import { COLORS } from '../../constants/colors';
import { formatCurrency } from '../../utils/formatters';
import styles from './ComparisonChart.module.css';

export function ComparisonChart({ chartData }) {
  if (!chartData || chartData.length === 0) {
    return null;
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipLabel}>Month {label}</p>
          {payload.map((entry, index) => (
            <p key={index} className={styles.tooltipValue} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <h2 className={styles.chartHeader}>Comparison Over Time</h2>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="colorScenarioA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.loanBalanceA} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.loanBalanceA} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorScenarioB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.loanBalanceB} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.loanBalanceB} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorInvestment" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.investmentValue} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.investmentValue} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />

          <XAxis
            dataKey="month"
            label={{ value: 'Months', position: 'insideBottom', offset: -10 }}
            stroke={COLORS.textSecondary}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
          />

          <YAxis
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            stroke={COLORS.textSecondary}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              paddingTop: '20px'
            }}
          />

          <Area
            type="monotone"
            dataKey="scenarioA_loanBalance"
            name="A: Loan Balance"
            stroke={COLORS.loanBalanceA}
            fill="url(#colorScenarioA)"
            strokeWidth={2}
          />

          <Area
            type="monotone"
            dataKey="scenarioA_savings"
            name="A: Savings"
            stroke={COLORS.investmentValue}
            fill="url(#colorInvestment)"
            strokeWidth={2}
          />

          <Area
            type="monotone"
            dataKey="scenarioB_loanBalance"
            name="B: Loan Balance"
            stroke={COLORS.loanBalanceB}
            fill="url(#colorScenarioB)"
            strokeWidth={2}
          />

          <Area
            type="monotone"
            dataKey="scenarioC_investment"
            name="C: Investment Value"
            stroke="#FFA500"
            fill="url(#colorInvestment)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
