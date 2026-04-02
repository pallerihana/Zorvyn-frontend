import React, { useState } from 'react';
import { Table, Badge, Button, Modal, Form, Pagination } from 'react-bootstrap';
import { FaEdit, FaTrash, FaSearch, FaEye } from 'react-icons/fa';
import { useRole } from '../../contexts/RoleContext';

// Simple formatter functions inline
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getCategoryIcon = (category) => {
  const icons = {
    'Food & Dining': '🍔',
    'Transportation': '🚗',
    'Shopping': '🛍️',
    'Entertainment': '🎬',
    'Bills & Utilities': '💡',
    'Healthcare': '🏥',
    'Education': '📚',
    'Salary': '💰'
  };
  return icons[category] || '📊';
};

const TransactionList = ({ transactions, loading, onDelete, onUpdate }) => {
  const { isAdmin } = useRole();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredTransactions = transactions.filter(t =>
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const getTypeBadge = (type) => {
    return type === 'income' 
      ? <Badge bg="success">💰 Income</Badge>
      : <Badge bg="danger">💸 Expense</Badge>;
  };

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="position-relative" style={{ width: '300px' }}>
          <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
          <Form.Control
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ps-5"
          />
        </div>
        <div className="text-muted">
          Total: {filteredTransactions.length} transactions
        </div>
      </div>

      <div className="table-responsive">
        <Table hover>
          <thead className="bg-light">
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th className="text-end">Amount</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-5">
                  No transactions found
                </td>
              </tr>
            ) : (
              currentTransactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td>{formatDate(transaction.date)}</td>
                  <td><strong>{transaction.description}</strong></td>
                  <td>{getCategoryIcon(transaction.category)} {transaction.category}</td>
                  <td>{getTypeBadge(transaction.type)}</td>
                  <td className={`text-end fw-bold ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </td>
                  <td className="text-center">
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => {
                        setSelectedTransaction(transaction);
                        setShowViewModal(true);
                      }}
                      className="me-2"
                    >
                      <FaEye />
                    </Button>
                    {isAdmin && (
                      <>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowEditModal(true);
                          }}
                          className="me-2"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            if (window.confirm('Are you sure?')) {
                              onDelete(transaction._id);
                            }
                          }}
                        >
                          <FaTrash />
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} />
            {[...Array(totalPages).keys()].map(num => (
              <Pagination.Item
                key={num + 1}
                active={num + 1 === currentPage}
                onClick={() => setCurrentPage(num + 1)}
              >
                {num + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} />
          </Pagination>
        </div>
      )}

      {/* Modals here... */}
    </>
  );
};

export default TransactionList;