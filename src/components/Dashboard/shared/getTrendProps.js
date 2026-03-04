/**
 * Determines the appropriate props for DashboardMetricCard trend display
 * based on the current value and calculated trend.
 *
 * @param {number} value - The total/current count (e.g., total users, total insights)
 * @param {number|null} trend - The percentage change from last month (null if no comparison possible)
 * @returns {object} Props to spread onto DashboardMetricCard for trend display
 *
 * Scenarios handled:
 * - value=0, trend=null: No data at all → hide trend
 * - value>0, trend=null: Data exists but no activity in last 2 months → "no recent activity"
 * - trend=100: All current items are new (none last month) → "all new this month"
 * - trend=0: Same activity as last month → default "no change vs last month"
 * - trend>0 or <0: Normal percentage change → default labels
 */
const getTrendProps = (value, trend) => {
  // No data at all - show "0% no data"
  if (value === 0 && trend === null) {
    return {
      diff: 0,
      diffLabel: 'no data to compare',
      trendDirection: 'flat',
      showDiff: true,
    };
  }

  // Data exists but no activity in last 2 months to compare
  if (trend === null) {
    return {
      diff: '—',
      diffLabel: 'no recent activity',
      trendDirection: 'flat',
      showDiff: true,
    };
  }

  // 100% increase means all items this month are new (none last month)
  // Provide a clearer label for this edge case
  if (trend === 100) {
    return {
      diff: trend,
      diffLabel: 'all new this month',
      showDiff: true,
    };
  }

  // -100% decrease means no items this month (had some last month)
  if (trend === -100) {
    return {
      diff: trend,
      diffLabel: 'none this month',
      showDiff: true,
    };
  }

  // Normal case - let component auto-calculate direction and labels
  return {
    diff: trend,
    showDiff: true,
  };
};

export default getTrendProps;
