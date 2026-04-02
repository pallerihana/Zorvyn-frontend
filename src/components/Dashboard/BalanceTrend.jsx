import React, { useState } from 'react';
import { Card, ButtonGroup, Button } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { formatCurrency } from '../../utils/formatters';
import { CHART_COLORS } from '../../utils/constants';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const BalanceTrend = ({ data, loading }) => {
  const [period, setPeriod] = useState('monthly');

  const chartData = {
    labels: data?.map(item => {
      if (period === 'weekly') return `Week ${item.period.week}`;
      if (period === 'daily') return new Date(item.date).toLocaleDateString();
      return new Date(item.date).toLocaleDateString('default', { month: 'short', year: 'numeric' });
    }) || [],
    datasets: [
      {
        label: 'Income',
        data: data?.map(item => item.income) || [],
        borderColor: CHART_COLORS.success,
        backgroundColor: `${CHART_COLORS.success}20`,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Expense',
        data: data?.map(item => item.expense) || [],
        borderColor: CHART_COLORS.danger,
        backgroundColor: `${CHART_COLORS.danger}20`,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Balance',
        data: data?.map(item => item.balance) || [],
        borderColor: CHART_COLORS.primary,
        backgroundColor: `${CHART_COLORS.primary}20`,
        fill: true,
        tension: 0.4,
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += formatCurrency(context.parsed.y);
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => formatCurrency(value)
        }
      }
    }
  };

  return (
    <Card className="shadow-sm h-100">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Balance Trend</h5>
        <ButtonGroup size="sm">
          <Button
            variant={period === 'daily' ? 'primary' : 'outline-primary'}
            onClick={() => setPeriod('daily')}
          >
            Daily
          </Button>
          <Button
            variant={period === 'weekly' ? 'primary' : 'outline-primary'}
            onClick={() => setPeriod('weekly')}
          >
            Weekly
          </Button>
          <Button
            variant={period === 'monthly' ? 'primary' : 'outline-primary'}
            onClick={() => setPeriod('monthly')}
          >
            Monthly
          </Button>
        </ButtonGroup>
      </Card.Header>
      <Card.Body>
        <div style={{ height: '300px' }}>
          {loading ? (
            <div className="spinner-wrapper">
              <div className="spinner"></div>
            </div>
          ) : (
            <Line data={chartData} options={options} />
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default BalanceTrend;