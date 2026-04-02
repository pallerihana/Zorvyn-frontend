import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';
import { FaLightbulb, FaArrowUp , FaArrowDown , FaPiggyBank } from 'react-icons/fa';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const Insights = ({ insights, loading }) => {
  const getInsightIcon = (type) => {
    switch(type) {
      case 'positive':
        return <FaArrowUp  className="text-success" />;
      case 'negative':
        return <FaArrowDown  className="text-danger" />;
      default:
        return <FaLightbulb className="text-warning" />;
    }
  };

  const getInsightColor = (type) => {
    switch(type) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'danger';
      default:
        return 'warning';
    }
  };

  const insightItems = [
    {
      id: 1,
      title: 'Highest Spending Category',
      content: insights?.highestSpendingCategory 
        ? `${insights.highestSpendingCategory.category}: ${formatCurrency(insights.highestSpendingCategory.amount)}`
        : 'No data available',
      type: 'neutral'
    },
    {
      id: 2,
      title: 'Monthly Comparison',
      content: insights?.monthlyComparison 
        ? `${insights.monthlyComparison.trend === 'increased' ? '↑' : '↓'} ${Math.abs(insights.monthlyComparison.change)}% vs last month`
        : 'No data available',
      type: insights?.monthlyComparison?.change <= 0 ? 'positive' : 'negative'
    },
    {
      id: 3,
      title: 'Savings Rate',
      content: insights?.savingsRate 
        ? `${formatPercentage(insights.savingsRate)} of income saved`
        : 'No data available',
      type: insights?.savingsRate >= 20 ? 'positive' : 'neutral'
    },
    {
      id: 4,
      title: 'Average Monthly Expense',
      content: insights?.averageMonthlyExpense 
        ? formatCurrency(insights.averageMonthlyExpense)
        : 'No data available',
      type: 'neutral'
    }
  ];

  return (
    <Card className="shadow-sm h-100">
      <Card.Header className="bg-white">
        <h5 className="mb-0">
          <FaLightbulb className="me-2 text-warning" />
          Financial Insights
        </h5>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="spinner-wrapper" style={{ minHeight: '200px' }}>
            <div className="spinner"></div>
          </div>
        ) : (
          <ListGroup variant="flush">
            {insightItems.map((insight) => (
              <ListGroup.Item key={insight.id} className="d-flex justify-content-between align-items-start py-3">
                <div className="ms-2 me-auto">
                  <div className="fw-bold">{insight.title}</div>
                  <small className="text-muted">{insight.content}</small>
                </div>
                <Badge bg={getInsightColor(insight.type)} pill>
                  {getInsightIcon(insight.type)}
                </Badge>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
};

export default Insights;