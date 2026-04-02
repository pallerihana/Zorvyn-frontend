import { useState, useEffect, useCallback } from 'react';
import { transactionService } from '../services/api';

export const useTransactions = (initialFilters = {}) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    search: '',
    sort: '-date',
    startDate: null,
    endDate: null,
    limit: 50,
    page: 1,
    ...initialFilters
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 50
  });

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      
      // Add filters to params
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.sort) params.sort = filters.sort;
      if (filters.limit) params.limit = filters.limit;
      if (filters.page) params.page = filters.page;
      if (filters.startDate) params.startDate = filters.startDate.toISOString();
      if (filters.endDate) params.endDate = filters.endDate.toISOString();
      
      const response = await transactionService.getAll(params);
      let data = response.data.data;
      
      // Apply search filter locally (if backend doesn't support it)
      if (filters.search) {
        data = data.filter(t => 
          t.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          t.category.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      setTransactions(data);
      setPagination({
        total: response.data.total,
        page: response.data.page,
        pages: response.data.pages,
        limit: response.data.limit
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch transactions');
      console.error('Transactions fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const addTransaction = useCallback(async (transactionData) => {
    setLoading(true);
    try {
      const response = await transactionService.create(transactionData);
      setTransactions(prev => [response.data.data, ...prev]);
      await fetchTransactions(); // Refresh to update pagination
      return { success: true, data: response.data.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add transaction');
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  }, [fetchTransactions]);

  const updateTransaction = useCallback(async (id, transactionData) => {
    setLoading(true);
    try {
      const response = await transactionService.update(id, transactionData);
      setTransactions(prev => 
        prev.map(t => t._id === id ? response.data.data : t)
      );
      return { success: true, data: response.data.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update transaction');
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    setLoading(true);
    try {
      await transactionService.delete(id);
      setTransactions(prev => prev.filter(t => t._id !== id));
      await fetchTransactions(); // Refresh to update pagination
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete transaction');
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  }, [fetchTransactions]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters, page: 1 };
      return updated;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      type: '',
      category: '',
      search: '',
      sort: '-date',
      startDate: null,
      endDate: null,
      limit: 50,
      page: 1
    });
  }, []);

  const goToPage = useCallback((page) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const getFilteredTransactions = useCallback(() => {
    let filtered = [...transactions];
    
    // Apply local filters (if not already applied on server)
    if (filters.search) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.category.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    return filtered;
  }, [transactions, filters]);

  const getStatistics = useCallback(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    const categoryBreakdown = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      });
    
    return {
      totalIncome,
      totalExpense,
      balance,
      categoryBreakdown,
      totalTransactions: transactions.length
    };
  }, [transactions]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    // Data
    transactions: getFilteredTransactions(),
    allTransactions: transactions,
    loading,
    error,
    filters,
    pagination,
    
    // Statistics
    statistics: getStatistics(),
    
    // Actions
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateFilters,
    resetFilters,
    goToPage,
    
    // Helpers
    getFilteredTransactions,
    getStatistics
  };
};