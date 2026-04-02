import React, { useState } from 'react';
import { Badge, Button, Collapse } from 'react-bootstrap';
import { FaEdit, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { formatCurrency, formatDate, getCategoryIcon } from '../../utils/formatters';
import { useRole } from '../../contexts/RoleContext';

const TransactionRow = ({ transaction, onEdit, onDelete }) => {
  const { isAdmin } = useRole();
  const [showDetails, setShowDetails] = useState(false);

  const getTypeBadge = (type) => {
    return type === 'income'
      ? <Badge bg="success">Income</Badge>
      : <Badge bg="danger">Expense</Badge>;
  };

  const getAmountColor = (type) => {
    return type === 'income' ? 'text-success' : 'text-danger';
  };

  return (
    <>
      <tr style={{ cursor: 'pointer' }} onClick={() => setShowDetails(!showDetails)}>
        <td className="align-middle">
          <Button
            variant="link"
            size="sm"
            className="p-0 me-2"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
          >
            {showDetails ? <FaChevronUp /> : <FaChevronDown />}
          </Button>
          {formatDate(transaction.date)}
        </td>
        <td className="align-middle">
          <strong>{transaction.description}</strong>
        </td>
        <td className="align-middle">
          <span>
            {getCategoryIcon(transaction.category)} {transaction.category}
          </span>
        </td>
        <td className="align-middle">{getTypeBadge(transaction.type)}</td>
        <td className={`align-middle text-end fw-bold ${getAmountColor(transaction.type)}`}>
          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
        </td>
        {isAdmin && (
          <td className="align-middle text-center">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(transaction);
              }}
              className="me-2"
            >
              <FaEdit />
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to delete this transaction?')) {
                  onDelete(transaction._id);
                }
              }}
            >
              <FaTrash />
            </Button>
          </td>
        )}
      </tr>
      <tr>
        <td colSpan={isAdmin ? 6 : 5} className="p-0">
          <Collapse in={showDetails}>
            <div className="p-3 bg-light">
              <div className="row">
                <div className="col-md-6">
                  <strong>Transaction ID:</strong> {transaction._id}
                </div>
                <div className="col-md-6">
                  <strong>Created:</strong> {formatDate(transaction.createdAt)}
                </div>
                <div className="col-md-12 mt-2">
                  <strong>Full Description:</strong> {transaction.description}
                </div>
                <div className="col-md-6 mt-2">
                  <strong>Category:</strong> {transaction.category}
                </div>
                <div className="col-md-6 mt-2">
                  <strong>Type:</strong> {transaction.type}
                </div>
                <div className="col-md-6 mt-2">
                  <strong>Amount:</strong> {formatCurrency(transaction.amount)}
                </div>
                <div className="col-md-6 mt-2">
                  <strong>Date:</strong> {formatDate(transaction.date)}
                </div>
              </div>
            </div>
          </Collapse>
        </td>
      </tr>
    </>
  );
};

export default TransactionRow;