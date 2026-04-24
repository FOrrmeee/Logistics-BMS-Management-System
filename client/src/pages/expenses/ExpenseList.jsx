import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useNotify } from '../../context/NotificationContext';
import { useCurrency } from '../../context/CurrencyContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const ExpenseList = () => {
  const { formatCurrency } = useCurrency();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();
  const notify = useNotify();

  const fetchExpenses = async () => {
    try {
      const { data } = await api.get('/expenses');
      setExpenses(data);
    } catch (err) {
      notify.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleDelete = async () => {
    try {
      await api.delete(`/expenses/${deleteId}`);
      notify.success('Expense deleted');
      setDeleteId(null);
      fetchExpenses();
    } catch (err) {
      notify.error('Delete failed');
    }
  };



  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1>Payments</h1>
        <button className="btn btn-primary" onClick={() => navigate('/expenses/new')}>
          <Plus size={18} /> New Expense
        </button>
      </div>

      <div className="data-table-wrapper glass-card" style={{ padding: 0 }}>
        {expenses.length > 0 ? (
          <table className="data-table">
            <thead><tr><th>Bayan Number</th><th>Agent</th><th>Port</th><th>Wages</th><th>Appt</th><th>Customs</th><th>Transport</th><th>To Transporter</th><th>Total</th><th>Actions</th></tr></thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e._id}>
                  <td className="font-mono">{e.bayan || <span className="text-muted">-</span>}</td>
                  <td>{formatCurrency(e.agentFees)}</td>
                  <td>{formatCurrency(e.portFees)}</td>
                  <td>{formatCurrency(e.wagesPortsAuthority)}</td>
                  <td>{formatCurrency(e.appointmentFees)}</td>
                  <td>{formatCurrency(e.customsClearanceFees)}</td>
                  <td>{formatCurrency(e.transportationFees)}</td>
                  <td>{formatCurrency(e.toTransporter)}</td>
                  <td className="text-warning font-mono">{formatCurrency(e.totalPayments)}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-ghost btn-icon" onClick={() => navigate(`/expenses/edit/${e._id}`)}><Edit size={16} /></button>
                      <button className="btn btn-ghost btn-icon text-danger" onClick={() => setDeleteId(e._id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state"><h3>No expenses found</h3><p className="text-muted">Create expenses standalone or via an invoice.</p></div>
        )}
      </div>

      <Modal isOpen={!!deleteId} title="Delete Expense" message="Are you sure you want to delete this expense record?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} confirmText="Delete" danger />
    </div>
  );
};

export default ExpenseList;
