import { useState, useEffect } from 'react';
import { Edit, Save, X } from 'lucide-react';
import api from '../services/api';
import { useNotify } from '../context/NotificationContext';
import { useCurrency } from '../context/CurrencyContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AccountPart = () => {
  const { formatCurrency } = useCurrency();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const notify = useNotify();

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ totalIncome: 0, toHassan: 0 });
  const [saving, setSaving] = useState(false);

  const fetchInvoices = async () => {
    try {
      const { data } = await api.get('/invoices');
      setInvoices(data);
    } catch (err) {
      notify.error('Failed to load accounts data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const handleEditClick = (inv) => {
    setEditingId(inv._id);
    setEditForm({
      totalIncome: inv.totalIncome || 0,
      toHassan: inv.toHassan || 0
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSave = async (id) => {
    setSaving(true);
    try {
      const { data } = await api.get(`/invoices/${id}`);
      const invData = data.invoice;
      
      const payload = {
        invoiceData: { ...invData, totalIncome: editForm.totalIncome, toHassan: editForm.toHassan },
        shipmentData: data.shipment || {},
        containerData: data.containers?.[0] || {},
        expenseData: data.expense || {}
      };

      await api.put(`/invoices/${id}`, payload);
      notify.success('Account information updated');
      setEditingId(null);
      fetchInvoices();
    } catch (err) {
      notify.error('Update failed');
    } finally {
      setSaving(false);
    }
  };



  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">This part of the accounts</h1>
      </div>
      
      <div className="data-table-wrapper glass-card" style={{ padding: 0 }}>
        {invoices.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Bayan Number</th>
                <th>Total Income</th>
                <th>To Transporter</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv._id}>
                  <td className="font-mono">{inv.invoiceNumber}</td>
                  <td>{inv.bayan}</td>
                  
                  {editingId === inv._id ? (
                    <>
                      <td>
                        <input type="number" className="form-input" style={{ width: '120px' }} value={editForm.totalIncome} onChange={(e) => setEditForm(p => ({ ...p, totalIncome: Number(e.target.value) || 0 }))} />
                      </td>
                      <td>
                        <input type="number" className="form-input" style={{ width: '120px' }} value={editForm.toHassan} onChange={(e) => setEditForm(p => ({ ...p, toHassan: Number(e.target.value) || 0 }))} />
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-ghost btn-icon text-success" onClick={() => handleSave(inv._id)} disabled={saving} title="Save"><Save size={16} /></button>
                          <button className="btn btn-ghost btn-icon text-danger" onClick={handleCancelEdit} disabled={saving} title="Cancel"><X size={16} /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="text-success">{formatCurrency(inv.totalIncome)}</td>
                      <td>{formatCurrency(inv.toHassan)}</td>
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-ghost btn-icon" onClick={() => handleEditClick(inv)} title="Edit Accounts"><Edit size={16} /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p className="text-muted">No accounts data found. Please create an invoice first.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPart;
