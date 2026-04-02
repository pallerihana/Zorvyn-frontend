import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { CATEGORIES, TRANSACTION_TYPES } from '../../utils/constants';

const TransactionForm = ({ transaction, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    description: '',
    date: new Date()
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        description: transaction.description,
        date: new Date(transaction.date)
      });
    }
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (name === 'type') {
      setFormData(prev => ({ ...prev, category: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!formData.description || formData.description.trim() === '') {
      newErrors.description = 'Please enter a description';
    } else if (formData.description.length > 200) {
      newErrors.description = 'Description cannot exceed 200 characters';
    }
    
    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
    }
  };

  const getCategories = () => {
    return CATEGORIES[formData.type] || CATEGORIES.expense;
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Type *</Form.Label>
            <Form.Select 
              name="type" 
              value={formData.type} 
              onChange={handleChange} 
              required
              className={errors.type ? 'is-invalid' : ''}
            >
              {TRANSACTION_TYPES.map(type => (
                <option key={type} value={type}>
                  {type === 'income' ? '💰 Income' : '💸 Expense'}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Amount *</Form.Label>
            <Form.Control
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              min="0.01"
              step="0.01"
              required
              className={errors.amount ? 'is-invalid' : ''}
            />
            {errors.amount && (
              <Form.Text className="text-danger">{errors.amount}</Form.Text>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Category *</Form.Label>
        <Form.Select 
          name="category" 
          value={formData.category} 
          onChange={handleChange} 
          required
          className={errors.category ? 'is-invalid' : ''}
        >
          <option value="">Select a category</option>
          {getCategories().map(category => {
            const emoji = {
              'Salary': '💰', 'Investment': '📈', 'Freelance': '💻', 
              'Gift': '🎁', 'Other Income': '💵', 'Food & Dining': '🍔',
              'Groceries': '🛒', 'Transportation': '🚗', 'Shopping': '🛍️',
              'Entertainment': '🎬', 'Bills & Utilities': '💡', 'Rent': '🏠',
              'Healthcare': '🏥', 'Education': '📚', 'Other': '📝'
            };
            return (
              <option key={category} value={category}>
                {emoji[category] || '📊'} {category}
              </option>
            );
          })}
        </Form.Select>
        {errors.category && (
          <Form.Text className="text-danger">{errors.category}</Form.Text>
        )}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Description *</Form.Label>
        <Form.Control
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter description"
          required
          className={errors.description ? 'is-invalid' : ''}
        />
        {errors.description && (
          <Form.Text className="text-danger">{errors.description}</Form.Text>
        )}
        <Form.Text className="text-muted">
          {formData.description.length}/200 characters
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label>Date *</Form.Label>
        <DatePicker
          selected={formData.date}
          onChange={(date) => setFormData(prev => ({ ...prev, date }))}
          className={`form-control ${errors.date ? 'is-invalid' : ''}`}
          dateFormat="yyyy-MM-dd"
          maxDate={new Date()}
          required
        />
        {errors.date && (
          <Form.Text className="text-danger">{errors.date}</Form.Text>
        )}
      </Form.Group>

      <div className="d-flex gap-2">
        <Button type="submit" variant="primary">
          {transaction ? 'Update Transaction' : 'Add Transaction'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Form>
  );
};

export default TransactionForm;