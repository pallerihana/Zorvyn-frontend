// Transaction categories (must match backend enum)
export const CATEGORIES = {
  income: [
    'Salary',
    'Investment',
    'Freelance',
    'Gift',
    'Other Income'
  ],
  expense: [
    'Food & Dining',
    'Groceries',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Rent',
    'Healthcare',
    'Education',
    'Other'
  ]
};

// Transaction types
export const TRANSACTION_TYPES = ['income', 'expense'];

// Sort options
export const SORT_OPTIONS = [
  { value: '-date', label: 'Newest First' },
  { value: 'date', label: 'Oldest First' },
  { value: '-amount', label: 'Highest Amount' },
  { value: 'amount', label: 'Lowest Amount' }
];

// Chart colors
export const CHART_COLORS = {
  primary: '#4361ee',
  success: '#06d6a0',
  danger: '#ef476f',
  warning: '#ffd166',
  info: '#4cc9f0',
  purple: '#7209b7'
};

// Insights messages
export const INSIGHTS_MESSAGES = {
  highSpending: 'You are spending a lot on {category}. Consider reducing this expense.',
  goodSavings: 'Great job! Your savings rate is above 20%. Keep it up! 🎉',
  expenseIncrease: 'Your expenses increased by {percentage}% compared to last month. Review your spending.',
  expenseDecrease: 'Good job! Your expenses decreased by {percentage}% compared to last month. 👍',
  lowSavings: 'Your savings rate is low. Try to save at least 20% of your income.',
  noData: 'Add some transactions to get personalized insights!',
  highIncome: 'Great income month! Consider investing the surplus.',
  budgetExceeded: 'You have exceeded your budget in {category}. Time to cut back!'
};

// Date range options
export const DATE_RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' }
];

// Transaction limits
export const TRANSACTION_LIMITS = [10, 20, 50, 100];

// Local storage keys
export const STORAGE_KEYS = {
  token: 'token',
  user: 'user',
  simulatedRole: 'simulatedRole',
  theme: 'theme',
  filters: 'transactionFilters'
};

// Default filters
export const DEFAULT_FILTERS = {
  type: '',
  category: '',
  search: '',
  sort: '-date',
  startDate: null,
  endDate: null,
  limit: 50,
  page: 1
};