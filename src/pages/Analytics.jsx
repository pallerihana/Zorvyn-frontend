import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, ButtonGroup, Button, Form, Badge } from 'react-bootstrap';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, RadialBarChart, RadialBar,
  ComposedChart, Scatter, ScatterChart
} from 'recharts';
import { FaChartLine, FaChartBar, FaChartPie, FaCalendarAlt, FaDownload, FaSync } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { dashboardService, transactionService } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ToastNotification from '../components/Common/ToastNotification';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const COLORS = ['#4361ee', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [timeRange, setTimeRange] = useState('6months');
  const [chartType, setChartType] = useState('line');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Processed data states
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [weeklyTrend, setWeeklyTrend] = useState([]);
  const [cumulativeData, setCumulativeData] = useState([]);
  const [incomeVsExpense, setIncomeVsExpense] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [dailyAverage, setDailyAverage] = useState([]);
  const [budgetProgress, setBudgetProgress] = useState([]);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await transactionService.getAll({ limit: 1000 });
      let allTransactions = response.data.data;
      
      // Filter by time range
      const filtered = filterByTimeRange(allTransactions, timeRange);
      setTransactions(filtered);
      
      // Process data for different charts
      processMonthlyData(filtered);
      processCategoryData(filtered);
      processWeeklyTrend(filtered);
      processCumulativeData(filtered);
      processIncomeVsExpense(filtered);
      processTopCategories(filtered);
      processDailyAverage(filtered);
      processBudgetProgress(filtered);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setToast({ show: true, message: 'Failed to load analytics data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filterByTimeRange = (data, range) => {
    const now = new Date();
    const months = {
      '1month': 1,
      '3months': 3,
      '6months': 6,
      '1year': 12,
      'all': 100
    };
    
    const cutoffDate = new Date();
    cutoffDate.setMonth(now.getMonth() - (months[range] || 6));
    
    return data.filter(t => new Date(t.date) >= cutoffDate);
  };

  const processMonthlyData = (data) => {
    const monthlyMap = new Map();
    
    data.forEach(transaction => {
      const date = new Date(transaction.date);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, { month: monthName, income: 0, expense: 0, savings: 0 });
      }
      
      const entry = monthlyMap.get(key);
      if (transaction.type === 'income') {
        entry.income += transaction.amount;
      } else {
        entry.expense += transaction.amount;
      }
      entry.savings = entry.income - entry.expense;
    });
    
    const sorted = Array.from(monthlyMap.values()).sort((a, b) => {
      return new Date(a.month) - new Date(b.month);
    });
    
    setMonthlyData(sorted);
  };

  const processCategoryData = (data) => {
    const categoryMap = new Map();
    
    data.forEach(transaction => {
      if (transaction.type === 'expense') {
        const current = categoryMap.get(transaction.category) || 0;
        categoryMap.set(transaction.category, current + transaction.amount);
      }
    });
    
    const sorted = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
    
    setCategoryData(sorted);
  };

  const processWeeklyTrend = (data) => {
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weeklyMap = new Map();
    
    weekDays.forEach(day => weeklyMap.set(day, { day, income: 0, expense: 0, count: 0 }));
    
    data.forEach(transaction => {
      const day = weekDays[new Date(transaction.date).getDay()];
      const entry = weeklyMap.get(day);
      if (transaction.type === 'income') {
        entry.income += transaction.amount;
      } else {
        entry.expense += transaction.amount;
      }
      entry.count++;
    });
    
    const trend = Array.from(weeklyMap.values()).map(day => ({
      ...day,
      average: day.count > 0 ? (day.expense / day.count) : 0
    }));
    
    setWeeklyTrend(trend);
  };

  const processCumulativeData = (data) => {
    const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    let runningBalance = 0;
    const cumulative = [];
    
    sorted.forEach(transaction => {
      if (transaction.type === 'income') {
        runningBalance += transaction.amount;
      } else {
        runningBalance -= transaction.amount;
      }
      
      cumulative.push({
        date: formatDate(transaction.date),
        balance: runningBalance,
        fullDate: new Date(transaction.date)
      });
    });
    
    // Take every nth point for better performance
    const sampled = cumulative.filter((_, i) => i % Math.ceil(cumulative.length / 30) === 0);
    setCumulativeData(sampled);
  };

  const processIncomeVsExpense = (data) => {
    const totalIncome = data.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    setIncomeVsExpense([
      { name: 'Income', value: totalIncome, color: '#10b981' },
      { name: 'Expense', value: totalExpense, color: '#ef4444' }
    ]);
  };

  const processTopCategories = (data) => {
    const categoryMap = new Map();
    
    data.forEach(transaction => {
      if (transaction.type === 'expense') {
        const current = categoryMap.get(transaction.category) || 0;
        categoryMap.set(transaction.category, current + transaction.amount);
      }
    });
    
    const sorted = Array.from(categoryMap.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    setTopCategories(sorted);
  };

  const processDailyAverage = (data) => {
    const expenses = data.filter(t => t.type === 'expense');
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const uniqueDays = new Set(data.map(t => new Date(t.date).toDateString())).size;
    const avgDaily = uniqueDays > 0 ? totalExpense / uniqueDays : 0;
    
    setDailyAverage([
      { name: 'Daily Average', value: avgDaily, fill: '#4361ee' }
    ]);
  };

  const processBudgetProgress = (data) => {
    const categoryBudget = new Map();
    
    data.forEach(transaction => {
      if (transaction.type === 'expense') {
        const current = categoryBudget.get(transaction.category) || 0;
        categoryBudget.set(transaction.category, current + transaction.amount);
      }
    });
    
    const budgets = Array.from(categoryBudget.entries())
      .map(([category, spent]) => ({
        category,
        spent,
        budget: spent * 1.2, // Mock budget (20% above actual for demo)
        percentage: Math.min(100, (spent / (spent * 1.2)) * 100)
      }))
      .slice(0, 6);
    
    setBudgetProgress(budgets);
  };

  const handleExport = () => {
    const exportData = {
      monthlyData,
      categoryData,
      weeklyTrend,
      cumulativeData,
      incomeVsExpense,
      topCategories,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setToast({ show: true, message: 'Analytics exported successfully!', type: 'success' });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded shadow-sm border">
          <p className="mb-1 fw-bold">{label}</p>
          {payload.map((p, idx) => (
            <p key={idx} className="mb-0" style={{ color: p.color }}>
              {p.name}: {formatCurrency(p.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <LoadingSpinner text="Loading analytics data..." />;
  }

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : 0;

  return (
    <Container fluid className="py-4">
      <ToastNotification
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        message={toast.message}
        type={toast.type}
      />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="mb-1" style={{ color: '#1e293b' }}>Financial Analytics</h2>
          <p className="mb-0" style={{ color: '#64748b' }}>
            Comprehensive insights and visualizations of your financial data
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={handleExport}>
            <FaDownload className="me-2" />
            Export
          </Button>
          <Button variant="primary" onClick={fetchData}>
            <FaSync className="me-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <Row className="g-4 mb-4">
        <Col lg={3} md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-4">
              <h6 className="text-muted mb-2">Total Income</h6>
              <h3 className="text-success mb-0">{formatCurrency(totalIncome)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-4">
              <h6 className="text-muted mb-2">Total Expenses</h6>
              <h3 className="text-danger mb-0">{formatCurrency(totalExpense)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-4">
              <h6 className="text-muted mb-2">Net Savings</h6>
              <h3 className={savings >= 0 ? 'text-success' : 'text-danger'} mb-0>
                {formatCurrency(savings)}
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-4">
              <h6 className="text-muted mb-2">Savings Rate</h6>
              <h3 className="text-primary mb-0">{savingsRate}%</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Time Range Filter */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div className="d-flex align-items-center gap-3">
                <FaCalendarAlt className="text-muted" />
                <ButtonGroup>
                  <Button 
                    variant={timeRange === '1month' ? 'primary' : 'outline-primary'}
                    onClick={() => setTimeRange('1month')}
                    size="sm"
                  >
                    1 Month
                  </Button>
                  <Button 
                    variant={timeRange === '3months' ? 'primary' : 'outline-primary'}
                    onClick={() => setTimeRange('3months')}
                    size="sm"
                  >
                    3 Months
                  </Button>
                  <Button 
                    variant={timeRange === '6months' ? 'primary' : 'outline-primary'}
                    onClick={() => setTimeRange('6months')}
                    size="sm"
                  >
                    6 Months
                  </Button>
                  <Button 
                    variant={timeRange === '1year' ? 'primary' : 'outline-primary'}
                    onClick={() => setTimeRange('1year')}
                    size="sm"
                  >
                    1 Year
                  </Button>
                  <Button 
                    variant={timeRange === 'all' ? 'primary' : 'outline-primary'}
                    onClick={() => setTimeRange('all')}
                    size="sm"
                  >
                    All Time
                  </Button>
                </ButtonGroup>
              </div>
              <div className="text-muted small">
                {transactions.length} transactions analyzed
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Monthly Trends Chart */}
      <Row className="g-4 mb-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-4">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FaChartLine className="me-2 text-primary" />
                  Monthly Financial Trends
                </h5>
                <ButtonGroup size="sm">
                  <Button variant={chartType === 'line' ? 'primary' : 'outline-secondary'} onClick={() => setChartType('line')}>
                    Line
                  </Button>
                  <Button variant={chartType === 'bar' ? 'primary' : 'outline-secondary'} onClick={() => setChartType('bar')}>
                    Bar
                  </Button>
                  <Button variant={chartType === 'area' ? 'primary' : 'outline-secondary'} onClick={() => setChartType('area')}>
                    Area
                  </Button>
                </ButtonGroup>
              </div>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={400}>
                {chartType === 'line' && (
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis tickFormatter={(v) => formatCurrency(v)} stroke="#64748b" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} name="Income" />
                    <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} name="Expense" />
                    <Line type="monotone" dataKey="savings" stroke="#4361ee" strokeWidth={2} dot={{ fill: '#4361ee' }} name="Savings" />
                  </LineChart>
                )}
                {chartType === 'bar' && (
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis tickFormatter={(v) => formatCurrency(v)} stroke="#64748b" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="income" fill="#10b981" name="Income" />
                    <Bar dataKey="expense" fill="#ef4444" name="Expense" />
                  </BarChart>
                )}
                {chartType === 'area' && (
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis tickFormatter={(v) => formatCurrency(v)} stroke="#64748b" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="income" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Income" />
                    <Area type="monotone" dataKey="expense" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Expense" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-4">
              <h5 className="mb-0">
                <FaChartPie className="me-2 text-primary" />
                Income vs Expenses
              </h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incomeVsExpense}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {incomeVsExpense.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center mt-3">
                <Badge bg="success" className="me-2">Income: {formatCurrency(totalIncome)}</Badge>
                <Badge bg="danger">Expense: {formatCurrency(totalExpense)}</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Category Analysis */}
      <Row className="g-4 mb-4">
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-4">
              <h5 className="mb-0">
                <FaChartBar className="me-2 text-primary" />
                Top Spending Categories
              </h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={topCategories} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="amount" fill="#4361ee" radius={[0, 8, 8, 0]}>
                    {topCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-4">
              <h5 className="mb-0">
                <FaChartPie className="me-2 text-primary" />
                Expense Distribution
              </h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Weekly Pattern & Cumulative Balance */}
      <Row className="g-4 mb-4">
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-4">
              <h5 className="mb-0">Weekly Spending Pattern</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="income" fill="#10b981" name="Income" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-4">
              <h5 className="mb-0">Cumulative Balance Trend</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={cumulativeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="balance" stroke="#4361ee" fill="#4361ee" fillOpacity={0.3} name="Balance" />
                </AreaChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Budget Progress & Daily Average */}
      <Row className="g-4">
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-4">
              <h5 className="mb-0">Budget Progress by Category</h5>
            </Card.Header>
            <Card.Body>
              {budgetProgress.map((item, idx) => (
                <div key={idx} className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="fw-semibold">{item.category}</span>
                    <span className="text-muted small">
                      {formatCurrency(item.spent)} / {formatCurrency(item.budget)}
                    </span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div 
                      className={`progress-bar ${item.percentage > 90 ? 'bg-danger' : item.percentage > 70 ? 'bg-warning' : 'bg-success'}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <small className="text-muted">{item.percentage.toFixed(0)}% of budget used</small>
                </div>
              ))}
              {budgetProgress.length === 0 && (
                <div className="text-center py-5">
                  <p className="text-muted mb-0">No budget data available</p>
                  <small>Add more transactions to see budget insights</small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-4">
              <h5 className="mb-0">Daily Average Spending</h5>
            </Card.Header>
            <Card.Body className="d-flex flex-column justify-content-center">
              <ResponsiveContainer width="100%" height={250}>
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="40%" 
                  outerRadius="80%" 
                  data={dailyAverage}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    minAngle={15}
                    background
                    clockWise={true}
                    dataKey="value"
                    fill="#4361ee"
                    cornerRadius={10}
                  />
                  <Legend
                    iconSize={10}
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    formatter={(value, entry) => `${value}: ${formatCurrency(entry.payload.value)}`}
                  />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="text-center mt-3">
                <h4 className="text-primary mb-0">{formatCurrency(dailyAverage[0]?.value || 0)}</h4>
                <small className="text-muted">average spent per day</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Analytics;