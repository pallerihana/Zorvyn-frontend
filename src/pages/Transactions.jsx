import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Card, Button, Modal, Form, Row, Col, Badge, InputGroup, Pagination } from 'react-bootstrap';
import { 
  FaPlus, FaDownload, FaTimes, FaEye, FaEdit, FaTrash, 
  FaSearch, FaFilter, FaSort, FaSortUp, FaSortDown,
  FaFileExport, FaSpinner
} from 'react-icons/fa';
import { useTransactions } from '../contexts/TransactionContext';
import { useRole } from '../contexts/RoleContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ToastNotification from '../components/Common/ToastNotification';
import TransactionFilters from '../components/Transactions/TransactionFilters';

// Utility functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDateTime = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const categoryIcons = {
  'Salary': '💰', 'Investment': '📈', 'Freelance': '💻', 'Gift': '🎁', 'Other Income': '💵',
  'Food & Dining': '🍔', 'Groceries': '🛒', 'Transportation': '🚗', 'Shopping': '🛍️',
  'Entertainment': '🎬', 'Bills & Utilities': '💡', 'Rent': '🏠', 'Healthcare': '🏥',
  'Education': '📚', 'Other': '📝'
};

const Transactions = () => {
  const { isActualAdmin } = useRole();
  const { user } = useAuth();
  const {
    transactions,
    loading,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction
  } = useTransactions();

  // State management
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Advanced filters state
  const [advancedFilters, setAdvancedFilters] = useState({
    type: '',
    category: '',
    search: '',
    sort: '-date',
    startDate: null,
    endDate: null,
    limit: 50
  });

  // Fetch transactions on mount
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    if (advancedFilters.type) {
      filtered = filtered.filter(t => t.type === advancedFilters.type);
    }
    if (advancedFilters.category) {
      filtered = filtered.filter(t => t.category === advancedFilters.category);
    }
    if (advancedFilters.startDate) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(advancedFilters.startDate));
    }
    if (advancedFilters.endDate) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(advancedFilters.endDate));
    }

    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'amount') {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      } else if (sortField === 'date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [transactions, searchTerm, filterType, sortField, sortOrder, advancedFilters]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredAndSortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, sortField, sortOrder, advancedFilters]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const handleFilterChange = (newFilters) => {
    setAdvancedFilters(prev => ({ ...prev, ...newFilters }));
    if (newFilters.type !== undefined) {
      setFilterType(newFilters.type === '' ? 'all' : newFilters.type);
    }
    if (newFilters.search !== undefined) {
      setSearchTerm(newFilters.search);
    }
  };

  const handleResetFilters = () => {
    setAdvancedFilters({
      type: '',
      category: '',
      search: '',
      sort: '-date',
      startDate: null,
      endDate: null,
      limit: 50
    });
    setSearchTerm('');
    setFilterType('all');
    setSortField('date');
    setSortOrder('desc');
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || formData.amount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    
    if (!formData.category) {
      showToast('Please select a category', 'error');
      return;
    }
    
    if (!formData.description.trim()) {
      showToast('Please enter a description', 'error');
      return;
    }

    setIsSubmitting(true);
    const result = await addTransaction(formData);
    setIsSubmitting(false);
    
    if (result.success) {
      setShowAddModal(false);
      setFormData({
        amount: '',
        type: 'expense',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      showToast('Transaction added successfully!', 'success');
    } else {
      showToast(result.error || 'Failed to add transaction', 'error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await updateTransaction(selectedTransaction._id, formData);
    setIsSubmitting(false);
    
    if (result.success) {
      setShowEditModal(false);
      setSelectedTransaction(null);
      showToast('Transaction updated successfully!', 'success');
    } else {
      showToast(result.error || 'Failed to update transaction', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedTransaction) return;
    
    setIsSubmitting(true);
    const result = await deleteTransaction(selectedTransaction._id);
    setIsSubmitting(false);
    
    if (result.success) {
      setShowDeleteConfirm(false);
      setSelectedTransaction(null);
      showToast('Transaction deleted successfully!', 'success');
    } else {
      showToast(result.error || 'Failed to delete transaction', 'error');
    }
  };

  const openEditModal = (transaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      description: transaction.description,
      date: new Date(transaction.date).toISOString().split('T')[0]
    });
    setShowEditModal(true);
  };

  const openDeleteConfirm = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDeleteConfirm(true);
  };

  const handleExport = () => {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const rows = filteredAndSortedTransactions.map(t => [
      formatDate(t.date),
      t.description,
      t.category,
      t.type,
      t.amount
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Transactions exported successfully!', 'success');
  };

  const SortButton = ({ field }) => (
    <Button
      variant="link"
      size="sm"
      className="text-decoration-none p-0 ms-1"
      onClick={() => {
        if (sortField === field) {
          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
          setSortField(field);
          setSortOrder('desc');
        }
      }}
    >
      {sortField === field ? (
        sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />
      ) : (
        <FaSort />
      )}
    </Button>
  );

  const getTypeBadge = (type) => {
    return type === 'income' 
      ? <Badge bg="success" className="px-3 py-2">💰 Income</Badge>
      : <Badge bg="danger" className="px-3 py-2">💸 Expense</Badge>;
  };

  if (loading && transactions.length === 0) {
    return <LoadingSpinner text="Loading your transactions..." />;
  }

  return (
    <Container fluid className="py-4">
      <ToastNotification
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        message={toast.message}
        type={toast.type}
      />

      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-dark mb-1">Transaction History</h2>
          <p className="text-dark-50 mb-0">
            {isActualAdmin ? '👑 Managing all user transactions' : '👁️ Managing your financial records'}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-primary" 
            onClick={() => setShowFilters(!showFilters)}
            className="px-3"
          >
            <FaFilter className="me-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button 
            variant="outline-success" 
            onClick={handleExport}
            disabled={filteredAndSortedTransactions.length === 0}
            className="px-3"
          >
            <FaFileExport className="me-2" />
            Export CSV
          </Button>
          <Button 
            variant="primary" 
            onClick={() => setShowAddModal(true)}
            className="px-4"
          >
            <FaPlus className="me-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Advanced Filters Component */}
      {showFilters && (
        <TransactionFilters
          filters={advancedFilters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      )}

      {/* Quick Filters Section */}
      <Card className="shadow-sm mb-4 border-0">
        <Card.Body>
          <Row className="align-items-end g-3">
            <Col md={5}>
              <Form.Label className="fw-semibold mb-1">
                <FaSearch className="me-1" /> Quick Search
              </Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-light">
                  <FaSearch className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by description or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0"
                />
                {searchTerm && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => setSearchTerm('')}
                  >
                    <FaTimes />
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Label className="fw-semibold mb-1">
                <FaFilter className="me-1" /> Transaction Type
              </Form.Label>
              <Form.Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-white"
              >
                <option value="all">All Transactions</option>
                <option value="income">💰 Income Only</option>
                <option value="expense">💸 Expense Only</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <div className="d-flex justify-content-end gap-2">
                <div className="text-muted small align-self-center">
                  <strong>{filteredAndSortedTransactions.length}</strong> transaction{filteredAndSortedTransactions.length !== 1 ? 's' : ''} found
                </div>
                {(searchTerm || filterType !== 'all' || Object.values(advancedFilters).some(v => v)) && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={handleResetFilters}
                    className="text-danger"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Transactions Table */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '15%' }}>
                    Date <SortButton field="date" />
                  </th>
                  <th style={{ width: '30%' }}>Description</th>
                  <th style={{ width: '20%' }}>Category</th>
                  <th style={{ width: '15%' }}>Type</th>
                  <th style={{ width: '15%' }} className="text-end">
                    Amount <SortButton field="amount" />
                  </th>
                  <th style={{ width: '5%' }} className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <div className="empty-state-icon mb-3">📭</div>
                      <h6 className="mb-1">No transactions found</h6>
                      <small className="text-muted">
                        {searchTerm || filterType !== 'all' || Object.values(advancedFilters).some(v => v)
                          ? 'Try adjusting your filters' 
                          : 'Click "Add Transaction" to get started'}
                      </small>
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((transaction) => (
                    <tr key={transaction._id} className="align-middle">
                      <td className="fw-medium">{formatDate(transaction.date)}</td>
                      <td>
                        <strong>{transaction.description}</strong>
                        <br />
                        <small className="text-muted">
                          {formatDateTime(transaction.createdAt)}
                        </small>
                      </td>
                      <td>
                        <Badge bg="light" text="dark" className="px-3 py-2">
                          {categoryIcons[transaction.category] || '📊'} {transaction.category}
                        </Badge>
                      </td>
                      <td>{getTypeBadge(transaction.type)}</td>
                      <td className={`text-end fw-bold fs-6 ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </td>
                      <td className="text-center">
                        <div className="d-flex gap-1 justify-content-center">
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowViewModal(true);
                            }}
                            title="View Details"
                            className="border-0"
                          >
                            <FaEye />
                          </Button>
                          {isActualAdmin && (
                            <>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => openEditModal(transaction)}
                                title="Edit"
                                className="border-0"
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => openDeleteConfirm(transaction)}
                                title="Delete"
                                className="border-0"
                              >
                                <FaTrash />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3 bg-light border-top">
              <div className="text-muted small">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedTransactions.length)} of {filteredAndSortedTransactions.length} entries
              </div>
              <Pagination className="mb-0">
                <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} />
                {[...Array(Math.min(totalPages, 5)).keys()].map(i => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  if (pageNum <= totalPages && pageNum > 0) {
                    return (
                      <Pagination.Item
                        key={pageNum}
                        active={pageNum === currentPage}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Pagination.Item>
                    );
                  }
                  return null;
                })}
                <Pagination.Next onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} />
                <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add Transaction Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-primary text-white border-0">
          <Modal.Title>
            <FaPlus className="me-2" />
            Add New Transaction
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddSubmit}>
          <Modal.Body className="py-4">
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Type</Form.Label>
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
          <Modal.Footer className="bg-light border-0">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <FaSpinner className="fa-spin me-2" />
                  Adding...
                </>
              ) : (
                'Add Transaction'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Transaction Modal - Only for Admin */}
      {isActualAdmin && (
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
          <Modal.Header closeButton className="bg-warning border-0">
            <Modal.Title>
              <FaEdit className="me-2" />
              Edit Transaction
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleEditSubmit}>
            <Modal.Body className="py-4">
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Type</Form.Label>
                    <Form.Select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })}
                      required
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
                      required
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
                >
                  <option value="">Select category</option>
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
                  required
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label className="fw-semibold">Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="bg-light border-0">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="warning" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <FaSpinner className="fa-spin me-2" />
                    Updating...
                  </>
                ) : (
                  'Update Transaction'
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}

      {/* View Transaction Modal - Visible to everyone */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered>
        <Modal.Header closeButton className="bg-info text-white border-0">
          <Modal.Title>
            <FaEye className="me-2" />
            Transaction Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTransaction && (
            <div className="p-3">
              <div className="mb-3 pb-2 border-bottom">
                <small className="text-muted d-block mb-1">Date & Time</small>
                <strong>{formatDateTime(selectedTransaction.date)}</strong>
              </div>
              <div className="mb-3 pb-2 border-bottom">
                <small className="text-muted d-block mb-1">Description</small>
                <strong>{selectedTransaction.description}</strong>
              </div>
              <div className="mb-3 pb-2 border-bottom">
                <small className="text-muted d-block mb-1">Category</small>
                <strong>{categoryIcons[selectedTransaction.category]} {selectedTransaction.category}</strong>
              </div>
              <div className="mb-3 pb-2 border-bottom">
                <small className="text-muted d-block mb-1">Type</small>
                {getTypeBadge(selectedTransaction.type)}
              </div>
              <div className="mb-3 pb-2 border-bottom">
                <small className="text-muted d-block mb-1">Amount</small>
                <strong className={`fs-4 ${selectedTransaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                  {selectedTransaction.type === 'income' ? '+' : '-'}{formatCurrency(selectedTransaction.amount)}
                </strong>
              </div>
              <div>
                <small className="text-muted d-block mb-1">Transaction ID</small>
                <code className="small">{selectedTransaction._id}</code>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light border-0">
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal - Only for Admin */}
      {isActualAdmin && (
        <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
          <Modal.Header closeButton className="bg-danger text-white border-0">
            <Modal.Title>
              <FaTrash className="me-2" />
              Confirm Delete
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete this transaction?</p>
            {selectedTransaction && (
              <div className="bg-light p-3 rounded">
                <small className="text-muted d-block">Description:</small>
                <strong>{selectedTransaction.description}</strong>
                <hr className="my-2" />
                <small className="text-muted d-block">Amount:</small>
                <strong className={selectedTransaction.type === 'income' ? 'text-success' : 'text-danger'}>
                  {selectedTransaction.type === 'income' ? '+' : '-'}{formatCurrency(selectedTransaction.amount)}
                </strong>
              </div>
            )}
            <p className="mt-3 mb-0 text-muted small">This action cannot be undone.</p>
          </Modal.Body>
          <Modal.Footer className="bg-light border-0">
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <FaSpinner className="fa-spin me-2" />
                  Deleting...
                </>
              ) : (
                'Delete Transaction'
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default Transactions;