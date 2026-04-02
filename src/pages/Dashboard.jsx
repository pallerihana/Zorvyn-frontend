import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { 
  FaPlus, FaWallet, FaArrowUp, FaArrowDown, FaChartPie, 
  FaLightbulb, FaChartLine, FaCalendarAlt, FaSpinner,
  FaTag, FaMoneyBillWave, FaPiggyBank
} from 'react-icons/fa';
import { FaArrowTrendUp } from 'react-icons/fa6'
import { useRole } from '../contexts/RoleContext';
import { useAuth } from '../contexts/AuthContext';
import { dashboardService, transactionService } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorAlert from '../components/Common/ErrorAlert';
import ToastNotification from '../components/Common/ToastNotification';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num);
};

const Dashboard = () => {
  const { isActualAdmin } = useRole();
  const { user } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [spending, setSpending] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, spendingRes, insightsRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getSpendingBreakdown(),
        dashboardService.getInsights()
      ]);
      
      setStats(statsRes.data.data);
      setSpending(spendingRes.data.data);
      setInsights(insightsRes.data.data);
    } catch (err) {
      console.error('Dashboard data fetch failed:', err);
      setError('Unable to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    setToast({ show: true, message: 'Dashboard refreshed successfully!', type: 'success' });
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || formData.amount <= 0) {
      setToast({ show: true, message: 'Please enter a valid amount', type: 'error' });
      return;
    }
    
    if (!formData.category) {
      setToast({ show: true, message: 'Please select a category', type: 'error' });
      return;
    }
    
    if (!formData.description.trim()) {
      setToast({ show: true, message: 'Please enter a description', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      await transactionService.create(formData);
      await fetchDashboardData();
      setShowAddModal(false);
      setFormData({
        amount: '',
        type: 'expense',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setToast({ show: true, message: 'Transaction added successfully!', type: 'success' });
    } catch (err) {
      setToast({ show: true, message: err.response?.data?.message || 'Failed to add transaction', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const SummaryCard = ({ title, value, icon, variant, prefix = '', suffix = '', subtitle }) => (
    <Card className="border-0 shadow-sm h-100 summary-card fade-in-up">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h6 className="mb-2 text-white-50">{title}</h6>
            <h2 className="mb-0 fw-bold text-white">{prefix}{formatCurrency(Math.abs(value))}{suffix}</h2>
            {subtitle && <small className="text-white-50 mt-1 d-block">{subtitle}</small>}
          </div>
          <div className="summary-icon">
            {icon}
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  if (loading && !stats) {
    return <LoadingSpinner text="Loading your financial data..." />;
  }

  return (
    <Container fluid className="py-4">
      <ToastNotification
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        message={toast.message}
        type={toast.type}
      />

      {error && <ErrorAlert error={error} onClose={() => setError(null)} className="mb-4" />}

      {/* Welcome Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div className="fade-in-up">
          <h2 className="mb-1" style={{ color: 'var(--text-primary)' }}>
            Welcome back, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>
            Here's what's happening with your finances
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-primary" 
            onClick={refreshData}
            disabled={refreshing}
            className="px-3"
          >
            {refreshing ? <FaSpinner className="fa-spin" /> : <FaChartLine />}
            <span className="ms-2">Refresh</span>
          </Button>
          <Button 
            variant="primary" 
            onClick={() => setShowAddModal(true)}
            className="shadow-sm px-4"
          >
            <FaPlus className="me-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <Row className="g-4 mb-4">
        <Col lg={4} md={6}>
          <SummaryCard
            title="Total Balance"
            value={stats?.totalBalance || 0}
            icon={<FaWallet size={32} />}
            variant="balance"
            subtitle={stats?.transactionCount === 0 ? "Add transactions to see balance" : `${formatNumber(stats?.transactionCount || 0)} transactions`}
          />
        </Col>
        <Col lg={4} md={6}>
          <SummaryCard
            title="Total Income"
            value={stats?.totalIncome || 0}
            icon={<FaArrowUp size={32} />}
            variant="income"
            prefix="+"
          />
        </Col>
        <Col lg={4} md={6}>
          <SummaryCard
            title="Total Expenses"
            value={stats?.totalExpense || 0}
            icon={<FaArrowDown size={32} />}
            variant="expense"
            prefix="-"
          />
        </Col>
      </Row>

      {/* Charts Section */}
      <Row className="g-4 mb-4">
        <Col lg={6}>
          <Card className="shadow-sm border-0 h-100 fade-in-up" style={{ animationDelay: '0.1s' }}>
            <Card.Header className="bg-transparent border-0 pt-4">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-2">
                  <FaChartPie className="text-primary" size={20} />
                </div>
                <h5 className="mb-0 fw-semibold">Spending by Category</h5>
              </div>
            </Card.Header>
            <Card.Body>
              {spending && spending.length > 0 ? (
                <div className="px-2">
                  {spending.slice(0, 6).map((category, idx) => (
                    <div key={idx} className="mb-3 category-item">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-secondary">
                          <FaTag className="me-1" size={12} />
                          {category.category}
                        </span>
                        <span className="fw-semibold">
                          {formatCurrency(category.total)} ({category.percentage}%)
                        </span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className="progress-bar progress-bar-striped progress-bar-animated" 
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {spending.length > 6 && (
                    <div className="text-center mt-3">
                      <small className="text-muted">+ {spending.length - 6} more categories</small>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="empty-state-icon mb-3">📊</div>
                  <p className="text-muted mb-0">No spending data available</p>
                  <small className="text-muted">Add expenses to see your spending breakdown</small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="shadow-sm border-0 h-100 fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Card.Header className="bg-transparent border-0 pt-4">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-warning bg-opacity-10 p-2 me-2">
                  <FaLightbulb className="text-warning" size={20} />
                </div>
                <h5 className="mb-0 fw-semibold">Financial Insights</h5>
              </div>
            </Card.Header>
            <Card.Body>
              {insights && insights.totalIncome > 0 ? (
                <div className="px-2">
                  <Row className="g-3">
                    <Col sm={6}>
                      <div className="insight-card p-3 rounded text-center h-100">
                        <div className="mb-2">
                          <FaTag className="text-primary" size={20} />
                        </div>
                        <small className="text-muted d-block mb-1">Top Category</small>
                        <strong className="d-block fs-5">{insights.highestSpendingCategory?.category || 'N/A'}</strong>
                        <small className="text-muted">{formatCurrency(insights.highestSpendingCategory?.amount || 0)}</small>
                      </div>
                    </Col>
                    <Col sm={6}>
                      <div className="insight-card p-3 rounded text-center h-100">
                        <div className="mb-2">
                          {insights.monthlyComparison?.trend === 'increased' ? 
                            <FaArrowTrendUp  className="text-danger" size={20} /> : 
                            <FaChartLine  className="text-success" size={20} />
                          }
                        </div>
                        <small className="text-muted d-block mb-1">Monthly Change</small>
                        <strong className={`d-block fs-5 ${insights.monthlyComparison?.trend === 'increased' ? 'text-danger' : 'text-success'}`}>
                          {insights.monthlyComparison?.trend === 'increased' ? '↑' : '↓'} {Math.abs(insights.monthlyComparison?.change || 0)}%
                        </strong>
                        <small className="text-muted">vs last month</small>
                      </div>
                    </Col>
                    <Col sm={6}>
                      <div className="insight-card p-3 rounded text-center h-100">
                        <div className="mb-2">
                          <FaPiggyBank className="text-success" size={20} />
                        </div>
                        <small className="text-muted d-block mb-1">Savings Rate</small>
                        <strong className="d-block fs-5 text-success">{insights.savingsRate || 0}%</strong>
                        <small className="text-muted">of income saved</small>
                      </div>
                    </Col>
                    <Col sm={6}>
                      <div className="insight-card p-3 rounded text-center h-100">
                        <div className="mb-2">
                          <FaMoneyBillWave className="text-info" size={20} />
                        </div>
                        <small className="text-muted d-block mb-1">Monthly Avg</small>
                        <strong className="d-block fs-5">{formatCurrency(insights.averageMonthlyExpense || 0)}</strong>
                        <small className="text-muted">per month</small>
                      </div>
                    </Col>
                  </Row>
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="empty-state-icon mb-3">💡</div>
                  <p className="text-muted mb-0">No insights available yet</p>
                  <small className="text-muted">Add transactions to receive personalized insights</small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Transactions Preview (Optional) */}
      {stats?.recentTransactions?.length > 0 && (
        <Row className="g-4">
          <Col>
            <Card className="shadow-sm border-0 fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Card.Header className="bg-transparent border-0 pt-4">
                <div className="d-flex align-items-center">
                  <div className="rounded-circle bg-info bg-opacity-10 p-2 me-2">
                    <FaCalendarAlt className="text-info" size={20} />
                  </div>
                  <h5 className="mb-0 fw-semibold">Recent Transactions</h5>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentTransactions.slice(0, 5).map((transaction, idx) => (
                        <tr key={idx}>
                          <td>{new Date(transaction.date).toLocaleDateString()}</td>
                          <td>{transaction.description}</td>
                          <td>
                            <span className="badge bg-light text-dark">
                              {transaction.category}
                            </span>
                          </td>
                          <td className={transaction.type === 'income' ? 'text-success fw-semibold' : 'text-danger fw-semibold'}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Add Transaction Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg" className="fade">
        <Modal.Header closeButton className="border-0 pt-4 px-4">
          <Modal.Title className="fw-bold">
            <FaPlus className="me-2 text-primary" />
            Add New Transaction
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddTransaction}>
          <Modal.Body className="py-4 px-4">
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Transaction Type</Form.Label>
                  <Form.Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })}
                    required
                    className="py-2"
                  >
                    <option value="expense">💸 Expense</option>
                    <option value="income">💰 Income</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Amount</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                    className="py-2"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mt-3">
              <Form.Label className="fw-semibold">Category</Form.Label>
              <Form.Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="py-2"
              >
                <option value="">Select a category</option>
                {formData.type === 'income' ? (
                  <>
                    <option value="Salary">💰 Salary</option>
                    <option value="Investment">📈 Investment</option>
                    <option value="Freelance">💻 Freelance</option>
                    <option value="Gift">🎁 Gift</option>
                    <option value="Other Income">💵 Other Income</option>
                  </>
                ) : (
                  <>
                    <option value="Food & Dining">🍔 Food & Dining</option>
                    <option value="Groceries">🛒 Groceries</option>
                    <option value="Transportation">🚗 Transportation</option>
                    <option value="Shopping">🛍️ Shopping</option>
                    <option value="Entertainment">🎬 Entertainment</option>
                    <option value="Bills & Utilities">💡 Bills & Utilities</option>
                    <option value="Rent">🏠 Rent</option>
                    <option value="Healthcare">🏥 Healthcare</option>
                    <option value="Education">📚 Education</option>
                    <option value="Other">📝 Other</option>
                  </>
                )}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label className="fw-semibold">Description</Form.Label>
              <Form.Control
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Grocery shopping, Monthly salary"
                required
                className="py-2"
              />
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label className="fw-semibold">Date</Form.Label>
              <Form.Control
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="py-2"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="bg-light border-0 rounded-bottom px-4 py-3">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Adding...
                </>
              ) : (
                'Add Transaction'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

    
    </Container>
  );
};

export default Dashboard;