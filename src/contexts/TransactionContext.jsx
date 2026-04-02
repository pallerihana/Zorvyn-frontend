import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from 'axios';

const TransactionContext = createContext();

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within TransactionProvider');
  }
  return context;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    search: '',
    sort: '-date'
  });

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.sort) params.sort = filters.sort;
      
      const response = await api.get('/transactions', { params });
      let data = response.data.data;
      
      // Apply search filter locally
      if (filters.search) {
        data = data.filter(t => 
          t.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          t.category.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      setTransactions(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const addTransaction = async (transactionData) => {
    try {
      const response = await api.post('/transactions', transactionData);
      setTransactions(prev => [response.data.data, ...prev]);
      return { success: true, data: response.data.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add transaction');
      return { success: false, error: err.response?.data?.message };
    }
  };

  const updateTransaction = async (id, transactionData) => {
    try {
      const response = await api.put(`/transactions/${id}`, transactionData);
      setTransactions(prev => 
        prev.map(t => t._id === id ? response.data.data : t)
      );
      return { success: true, data: response.data.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update transaction');
      return { success: false, error: err.response?.data?.message };
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions(prev => prev.filter(t => t._id !== id));
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete transaction');
      return { success: false, error: err.response?.data?.message };
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      type: '',
      category: '',
      search: '',
      sort: '-date'
    });
  };

  const value = {
    transactions,
    loading,
    error,
    filters,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateFilters,
    resetFilters
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};