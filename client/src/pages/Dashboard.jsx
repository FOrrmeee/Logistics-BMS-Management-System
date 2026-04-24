import { useState, useEffect } from 'react';
import { FileText, DollarSign, TrendingDown, TrendingUp, Container, Truck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard = () => {
  const { formatCurrency } = useCurrency();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState('monthly');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  const activeChartData = chartView === 'daily'
    ? (stats?.dailyChartData || [])
    : (stats?.chartData || []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    return (
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        fontSize: '0.8rem'
      }}>
        <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 8 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, marginBottom: 2 }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  };

  const toggleStyle = (view) => ({
    padding: '6px 18px',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.85rem',
    transition: 'all 0.2s',
    background: chartView === view ? 'var(--primary)' : 'transparent',
    color: chartView === view ? '#fff' : 'var(--text-muted)',
  });

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card primary" id="stat-invoices">
          <div className="stat-info">
            <div className="stat-label">Total Invoices</div>
            <div className="stat-value">{stats?.totalInvoices || 0}</div>
          </div>
          <div className="stat-icon primary"><FileText size={24} /></div>
        </div>

        <div className="stat-card emerald" id="stat-income">
          <div className="stat-info">
            <div className="stat-label">Total Income</div>
            <div className="stat-value">{formatCurrency(stats?.totalIncome)}</div>
          </div>
          <div className="stat-icon emerald"><DollarSign size={24} /></div>
        </div>

        <div className="stat-card amber" id="stat-expenses">
          <div className="stat-info">
            <div className="stat-label">Total Payments</div>
            <div className="stat-value">{formatCurrency(stats?.totalExpenses)}</div>
          </div>
          <div className="stat-icon amber"><TrendingDown size={24} /></div>
        </div>

        <div className="stat-card rose" id="stat-profit">
          <div className="stat-info">
            <div className="stat-label">Total Profit</div>
            <div className="stat-value">{formatCurrency(stats?.totalProfit)}</div>
          </div>
          <div className="stat-icon rose"><TrendingUp size={24} /></div>
        </div>

        <div className="stat-card primary" id="stat-containers">
          <div className="stat-info">
            <div className="stat-label">Total Containers</div>
            <div className="stat-value">{stats?.totalContainers || 0}</div>
          </div>
          <div className="stat-icon primary"><Container size={24} /></div>
        </div>
      </div>

      {/* Chart with Daily / Monthly toggle */}
      <div className="chart-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>{chartView === 'daily' ? 'Daily Overview' : 'Monthly Overview'}</h3>
          <div style={{
            display: 'flex',
            gap: 2,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: 3
          }}>
            <button style={toggleStyle('monthly')} onClick={() => setChartView('monthly')}>Monthly</button>
            <button style={toggleStyle('daily')} onClick={() => setChartView('daily')}>Daily</button>
          </div>
        </div>

        {activeChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={activeChartData}>
              <defs>
                <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={11}
                tick={{ angle: chartView === 'daily' ? -35 : 0, textAnchor: chartView === 'daily' ? 'end' : 'middle' }}
                height={chartView === 'daily' ? 55 : 30}
              />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#gradIncome)" name="Income" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" stroke="#f59e0b" fill="url(#gradExpenses)" name="Payments" strokeWidth={2} />
              <Area type="monotone" dataKey="profit" stroke="#6366f1" fill="url(#gradProfit)" name="Profit" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state">
            <p>No data available yet. Create some invoices to see the chart.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;