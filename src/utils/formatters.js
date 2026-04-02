// Currency formatter
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Date formatter
export const formatDate = (date) => {
  if (!date) return 'N/A';
  const dateObj = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
};

// Short date formatter
export const formatShortDate = (date) => {
  if (!date) return 'N/A';
  const dateObj = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(dateObj);
};

// Number formatter
export const formatNumber = (number) => {
  if (!number && number !== 0) return '0';
  return new Intl.NumberFormat('en-US').format(number);
};

// Percentage formatter
export const formatPercentage = (value) => {
  if (!value && value !== 0) return '0%';
  return `${value}%`;
};

// Get category icon emoji
export const getCategoryIcon = (category) => {
  const icons = {
    'Food & Dining': '🍔',
    'Food': '🍔',
    'Dining': '🍽️',
    'Transportation': '🚗',
    'Transport': '🚗',
    'Shopping': '🛍️',
    'Entertainment': '🎬',
    'Bills & Utilities': '💡',
    'Utilities': '💡',
    'Healthcare': '🏥',
    'Health': '🏥',
    'Education': '📚',
    'Salary': '💰',
    'Investment': '📈',
    'Freelance': '💻',
    'Gift': '🎁',
    'Other Income': '💰',
    'Other Expense': '📝',
    'Other': '📝',
    'Rent': '🏠',
    'Groceries': '🛒',
    'Coffee': '☕',
    'Travel': '✈️'
  };
  return icons[category] || '📊';
};

// Format transaction type
export const formatTransactionType = (type) => {
  return type === 'income' ? 'Income' : 'Expense';
};

// Format amount with sign
export const formatAmountWithSign = (amount, type) => {
  const formatted = formatCurrency(Math.abs(amount));
  return type === 'income' ? `+${formatted}` : `-${formatted}`;
};

// Get color based on transaction type
export const getTransactionColor = (type) => {
  return type === 'income' ? 'success' : 'danger';
};

// Format time ago
export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  return Math.floor(seconds) + ' seconds ago';
};