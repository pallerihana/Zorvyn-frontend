import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { FaWallet, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatters';

const SummaryCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Balance',
      value: stats?.totalBalance || 0,
      icon: <FaWallet size={32} />,
      variant: 'balance-card',
      prefix: ''
    },
    {
      title: 'Total Income',
      value: stats?.totalIncome || 0,
      icon: <FaArrowUp size={32} />,
      variant: 'income-card',
      prefix: '+'
    },
    {
      title: 'Total Expenses',
      value: stats?.totalExpense || 0,
      icon: <FaArrowDown size={32} />,
      variant: 'expense-card',
      prefix: '-'
    }
  ];

  return (
    <Row className="g-4 mb-4">
      {cards.map((card, idx) => (
        <Col key={idx} md={4}>
          <Card className={`summary-card ${card.variant} fade-in-up`} style={{ animationDelay: `${idx * 0.1}s` }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-2">{card.title}</h6>
                  <h2 className="text-white mb-0">
                    {card.prefix}{formatCurrency(Math.abs(card.value))}
                  </h2>
                </div>
                <div className="text-white-50">
                  {card.icon}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default SummaryCards;