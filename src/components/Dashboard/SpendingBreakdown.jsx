import React from 'react';
import { Card } from 'react-bootstrap';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { formatCurrency } from '../../utils/formatters';
import { CHART_COLORS } from '../../utils/constants';

ChartJS.register(ArcElement, Tooltip, Legend);

const SpendingBreakdown = ({ data, loading }) => {
  if (loading) {
    return (
      <Card className="shadow-sm h-100">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Spending Breakdown by Category</h5>
        </Card.Header>
        <Card.Body className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="shadow-sm h-100">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Spending Breakdown by Category</h5>
        </Card.Header>
        <Card.Body className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
          <div className="text-center">
            <div className="empty-state-icon mb-3">📊</div>
            <p className="text-muted mb-0">No spending data available</p>
            <small className="text-muted">Add some expense transactions to see breakdown</small>
          </div>
        </Card.Body>
      </Card>
    );
  }

  const chartData = {
    labels: data?.map(item => item.category) || [],
    datasets: [
      {
        data: data?.map(item => item.total) || [],
        backgroundColor: [
          '#4361ee', '#06d6a0', '#ef476f', '#ffd166', '#4cc9f0',
          '#7209b7', '#f8961e', '#4d908e', '#f9844a', '#4c3b4d'
        ],
        borderWidth: 0
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = data[context.dataIndex]?.percentage || 0;
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <Card className="shadow-sm h-100">
      <Card.Header className="bg-white">
        <h5 className="mb-0">Spending Breakdown by Category</h5>
      </Card.Header>
      <Card.Body>
        <div style={{ height: '300px' }}>
          <Pie data={chartData} options={options} />
        </div>
      </Card.Body>
    </Card>
  );
};

export default SpendingBreakdown;