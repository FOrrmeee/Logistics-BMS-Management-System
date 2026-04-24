import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Receipt } from 'lucide-react';
import api from '../../services/api';
import { useNotify } from '../../context/NotificationContext';
import { useCurrency } from '../../context/CurrencyContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ExpenseForm = () => {
  const { formatCurrency } = useCurrency();
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const notify = useNotify();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [expense, setExpense] = useState({ bayan: '', agentFees: 0, portFees: 0, wagesPortsAuthority: 0, appointmentFees: 0, customsClearanceFees: 0, transportationFees: 0, toTransporter: 0 });
  const [bayans, setBayans] = useState([]);

  useEffect(() => {
    const fetchBayans = async () => {
      try {
        const { data } = await api.get('/invoices/bayans');
        setBayans(data);
      } catch (err) {
        console.error('Failed to fetch bayan numbers', err);
      }
    };
    fetchBayans();
  }, []);

  useEffect(() => {
    if (isEdit) {
      const fetchExpense = async () => {
        try {
          const { data } = await api.get(`/expenses/${id}`);
          setExpense({
            bayan: data.bayan || '',
            agentFees: data.agentFees || 0,
            portFees: data.portFees || 0,
            wagesPortsAuthority: data.wagesPortsAuthority || 0,
            appointmentFees: data.appointmentFees || 0,
            customsClearanceFees: data.customsClearanceFees || 0,
            transportationFees: data.transportationFees || 0,
            toTransporter: data.toTransporter || 0
          });
        } catch (err) {
          notify.error('Failed to load expense');
          navigate('/expenses');
        } finally {
          setLoading(false);
        }
      };
      fetchExpense();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/expenses/${id}`, expense);
        notify.success('Expense updated');
      } else {
        await api.post('/expenses', expense);
        notify.success('Expense created');
      }
      navigate('/expenses');
    } catch (err) {
      notify.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, val) => setExpense(p => ({ ...p, [field]: val }));
  const updateNumericField = (field, val) => setExpense(p => ({ ...p, [field]: Number(val) || 0 }));
  
  const total = Object.entries(expense).reduce((sum, [k, v]) => (k === 'bayan' || k === 'toTransporter') ? sum : sum + (Number(v) || 0), 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1>{isEdit ? 'Edit Expense' : 'New Expense'}</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/expenses')}><ArrowLeft size={18} /> Back</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="glass-card" style={{ marginBottom: 24 }}>
          <div className="form-section-title"><Receipt size={18} /> Expense Details</div>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Bayan Number</label>
              <input 
                className="form-input" 
                value={expense.bayan} 
                onChange={e => updateField('bayan', e.target.value)} 
                placeholder="Enter bayan number" 
                list="bayan-list"
              />
              <datalist id="bayan-list">
                {bayans.map((b, i) => <option key={i} value={b} />)}
              </datalist>
            </div>
            <div className="form-group"><label className="form-label">Agent Fees</label><input type="number" step="any" min="0" className="form-input" value={expense.agentFees} onChange={e => updateNumericField('agentFees', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Port Fees</label><input type="number" step="any" min="0" className="form-input" value={expense.portFees} onChange={e => updateNumericField('portFees', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Wages Ports Authority</label><input type="number" step="any" min="0" className="form-input" value={expense.wagesPortsAuthority} onChange={e => updateNumericField('wagesPortsAuthority', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Appointment Fees</label><input type="number" step="any" min="0" className="form-input" value={expense.appointmentFees} onChange={e => updateNumericField('appointmentFees', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Customs Clearance</label><input type="number" step="any" min="0" className="form-input" value={expense.customsClearanceFees} onChange={e => updateNumericField('customsClearanceFees', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Transportation</label><input type="number" step="any" min="0" className="form-input" value={expense.transportationFees} onChange={e => updateNumericField('transportationFees', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">To Transporter</label><input type="number" step="any" min="0" className="form-input" value={expense.toTransporter} onChange={e => updateNumericField('toTransporter', e.target.value)} /></div>
          </div>
          <div className="mt-4" style={{ paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
            <span className="text-muted">Auto-Calculated Total Payments: </span>
            <span className="text-warning font-mono" style={{ fontSize: '1.25rem' }}>{formatCurrency(total)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}><Save size={18} /> {saving ? 'Saving...' : 'Save Expense'}</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/expenses')}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
