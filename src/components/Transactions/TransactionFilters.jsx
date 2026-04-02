import React, { useState } from 'react';
import { Form, Row, Col, Button, Badge, Accordion, InputGroup } from 'react-bootstrap';
import { 
  FaSearch, FaFilter, FaTimes, FaCalendarAlt, 
  FaSort, FaTag, FaExchangeAlt, FaChevronDown, 
  FaChevronUp, FaTrashAlt, FaSlidersH 
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import { CATEGORIES, SORT_OPTIONS, TRANSACTION_TYPES } from '../../utils/constants';

const TransactionFilters = ({ filters, onFilterChange, onReset }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [quickDateRange, setQuickDateRange] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  const handleDateRangeChange = (startDate, endDate) => {
    onFilterChange({ startDate, endDate });
    setQuickDateRange('');
  };

  const handleQuickDateRange = (range) => {
    setQuickDateRange(range);
    const now = new Date();
    let startDate = null;
    
    switch(range) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'yesterday':
        startDate = new Date(now.setDate(now.getDate() - 1));
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        return;
    }
    
    onFilterChange({ startDate, endDate: new Date() });
  };

  const clearFilter = (filterName) => {
    onFilterChange({ [filterName]: filterName === 'startDate' || filterName === 'endDate' ? null : '' });
  };

  const activeFiltersCount = Object.keys(filters).filter(key => {
    if (key === 'startDate' || key === 'endDate') return filters[key];
    return filters[key] && filters[key] !== '';
  }).length;

  const getActiveFilterDisplay = (key, value) => {
    switch(key) {
      case 'type':
        return value === 'income' ? '💰 Income' : '💸 Expense';
      case 'category':
        return value;
      case 'sort':
        return SORT_OPTIONS.find(opt => opt.value === value)?.label || value;
      default:
        return value;
    }
  };

  return (
    <div className="bg-white rounded shadow-sm mb-4 border">
      {/* Header */}
      <div 
        className="d-flex justify-content-between align-items-center p-3 border-bottom cursor-pointer"
        style={{ cursor: 'pointer', background: '#f8f9fa' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="d-flex align-items-center gap-2">
          <FaSlidersH className="text-primary" />
          <h6 className="mb-0 fw-semibold">Advanced Filters</h6>
          {activeFiltersCount > 0 && (
            <Badge bg="primary" pill className="ms-2">
              {activeFiltersCount} active
            </Badge>
          )}
        </div>
        <div className="d-flex align-items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button 
              variant="link" 
              size="sm" 
              onClick={(e) => { e.stopPropagation(); onReset(); }}
              className="text-danger text-decoration-none"
            >
              <FaTrashAlt className="me-1" size={12} />
              Reset All
            </Button>
          )}
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-3">
          {/* Quick Date Range Buttons */}
          <div className="mb-3">
            <Form.Label className="fw-semibold mb-2">Quick Date Range</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {['today', 'yesterday', 'week', 'month', 'quarter', 'year'].map((range) => (
                <Button
                  key={range}
                  variant={quickDateRange === range ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => handleQuickDateRange(range)}
                  className="px-3"
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <Row>
            {/* Search Field */}
            <Col lg={3} md={6} className="mb-3">
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <FaSearch className="me-1 text-muted" size={12} />
                  Search
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    name="search"
                    placeholder="Description or category..."
                    value={filters.search || ''}
                    onChange={handleChange}
                  />
                  {filters.search && (
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => clearFilter('search')}
                    >
                      <FaTimes />
                    </Button>
                  )}
                </InputGroup>
              </Form.Group>
            </Col>

            {/* Type Filter */}
            <Col lg={2} md={6} className="mb-3">
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <FaExchangeAlt className="me-1 text-muted" size={12} />
                  Type
                </Form.Label>
                <Form.Select
                  name="type"
                  value={filters.type || ''}
                  onChange={handleChange}
                  className="bg-white"
                >
                  <option value="">All Transactions</option>
                  {TRANSACTION_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type === 'income' ? '💰 Income' : '💸 Expense'}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Category Filter */}
            <Col lg={3} md={6} className="mb-3">
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <FaTag className="me-1 text-muted" size={12} />
                  Category
                </Form.Label>
                <Form.Select
                  name="category"
                  value={filters.category || ''}
                  onChange={handleChange}
                >
                  <option value="">All Categories</option>
                  {filters.type === 'income' && CATEGORIES.income.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  {filters.type === 'expense' && CATEGORIES.expense.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  {!filters.type && [...CATEGORIES.income, ...CATEGORIES.expense].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Sort By */}
            <Col lg={2} md={6} className="mb-3">
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <FaSort className="me-1 text-muted" size={12} />
                  Sort By
                </Form.Label>
                <Form.Select
                  name="sort"
                  value={filters.sort || '-date'}
                  onChange={handleChange}
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Items Per Page */}
            <Col lg={2} md={6} className="mb-3">
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">Show</Form.Label>
                <Form.Select
                  name="limit"
                  value={filters.limit || 50}
                  onChange={handleChange}
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Date Range Picker */}
          <Row>
            <Col lg={6} className="mb-3">
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  <FaCalendarAlt className="me-1 text-muted" size={12} />
                  Custom Date Range
                </Form.Label>
                <div className="d-flex gap-2 align-items-center">
                  <DatePicker
                    selected={filters.startDate}
                    onChange={(date) => handleDateRangeChange(date, filters.endDate)}
                    className="form-control"
                    placeholderText="Start Date"
                    dateFormat="yyyy-MM-dd"
                    isClearable
                  />
                  <span className="text-muted">→</span>
                  <DatePicker
                    selected={filters.endDate}
                    onChange={(date) => handleDateRangeChange(filters.startDate, date)}
                    className="form-control"
                    placeholderText="End Date"
                    dateFormat="yyyy-MM-dd"
                    isClearable
                  />
                  {(filters.startDate || filters.endDate) && (
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => handleDateRangeChange(null, null)}
                    >
                      <FaTimes />
                    </Button>
                  )}
                </div>
              </Form.Group>
            </Col>
          </Row>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="mt-3 pt-2 border-top">
              <small className="text-muted d-block mb-2">Active Filters:</small>
              <div className="d-flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (!value || value === '') return null;
                  if (key === 'startDate' || key === 'endDate') {
                    if (key === 'startDate' && filters.startDate) {
                      return (
                        <Badge key={key} bg="light" text="dark" className="d-flex align-items-center gap-2 px-3 py-2 border">
                          <FaCalendarAlt size={12} />
                          From: {new Date(value).toLocaleDateString()}
                          <FaTimes
                            size={12}
                            style={{ cursor: 'pointer' }}
                            onClick={() => clearFilter(key)}
                            className="ms-1 text-danger"
                          />
                        </Badge>
                      );
                    }
                    if (key === 'endDate' && filters.endDate && !filters.startDate) {
                      return (
                        <Badge key={key} bg="light" text="dark" className="d-flex align-items-center gap-2 px-3 py-2 border">
                          <FaCalendarAlt size={12} />
                          Until: {new Date(value).toLocaleDateString()}
                          <FaTimes
                            size={12}
                            style={{ cursor: 'pointer' }}
                            onClick={() => clearFilter(key)}
                            className="ms-1 text-danger"
                          />
                        </Badge>
                      );
                    }
                    return null;
                  }
                  
                  return (
                    <Badge key={key} bg="primary" className="d-flex align-items-center gap-2 px-3 py-2">
                      {key === 'search' && <FaSearch size={10} />}
                      {key === 'type' && <FaExchangeAlt size={10} />}
                      {key === 'category' && <FaTag size={10} />}
                      {key === 'sort' && <FaSort size={10} />}
                      <span>
                        {key}: {getActiveFilterDisplay(key, value)}
                      </span>
                      <FaTimes
                        size={12}
                        style={{ cursor: 'pointer' }}
                        onClick={() => clearFilter(key)}
                        className="ms-1"
                      />
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filter Stats */}
          <div className="mt-3 pt-2 border-top d-flex justify-content-between align-items-center">
            <small className="text-muted">
              <FaFilter className="me-1" size={12} />
              {activeFiltersCount} active filter{activeFiltersCount !== 1 ? 's' : ''}
            </small>
            <Button 
              variant="link" 
              size="sm" 
              onClick={onReset}
              className="text-primary text-decoration-none"
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionFilters;