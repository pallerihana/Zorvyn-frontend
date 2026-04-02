import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/api';

export const useDashboard = () => {
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState(null);
  const [spending, setSpending] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, trendRes, spendingRes, insightsRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getTrend(),
        dashboardService.getSpendingBreakdown(),
        dashboardService.getInsights()
      ]);
      
      setStats(statsRes.data.data);
      setTrend(trendRes.data.data);
      setSpending(spendingRes.data.data);
      setInsights(insightsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshDashboard = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getSummaryStats = useCallback(() => {
    if (!stats) return { totalBalance: 0, totalIncome: 0, totalExpense: 0 };
    return {
      totalBalance: stats.totalBalance,
      totalIncome: stats.totalIncome,
      totalExpense: stats.totalExpense,
      transactionCount: stats.transactionCount
    };
  }, [stats]);

  const getTrendByPeriod = useCallback((period = 'monthly') => {
    return trend?.filter(t => {
      if (period === 'daily') return true;
      if (period === 'weekly') return true;
      return true;
    }) || [];
  }, [trend]);

  const getTopSpendingCategories = useCallback((limit = 5) => {
    if (!spending) return [];
    return spending.slice(0, limit);
  }, [spending]);

  const getSavingsRate = useCallback(() => {
    if (!stats) return 0;
    if (stats.totalIncome === 0) return 0;
    return ((stats.totalIncome - stats.totalExpense) / stats.totalIncome * 100).toFixed(2);
  }, [stats]);

  return {
    // Data
    stats,
    trend,
    spending,
    insights,
    loading,
    error,
    
    // Actions
    refreshDashboard,
    
    // Computed values
    summaryStats: getSummaryStats(),
    topSpendingCategories: getTopSpendingCategories(),
    savingsRate: getSavingsRate(),
    
    // Helper functions
    getTrendByPeriod,
    getTopSpendingCategories
  };
};