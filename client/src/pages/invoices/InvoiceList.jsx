import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, FileDown } from 'lucide-react';
import api from '../../services/api';
import { useNotify } from '../../context/NotificationContext';
import { useCurrency } from '../../context/CurrencyContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { exportInvoicePDF } from '../../utils/pdfExport';
import { exportInvoicesExcel, exportSingleInvoiceExcel } from '../../utils/excelExport';

const InvoiceList = () => {
  const { formatCurrency } = useCurrency();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();
  const notify = useNotify();

  const fetchInvoices = async () => {
    try {
      const { data } = await api.get('/invoices', { params: { search } });
      setInvoices(data);
    } catch (err) {
      notify.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, [search]);

  const handleDelete = async () => {
    try {
      await api.delete(`/invoices/${deleteId}`);
      notify.success('Invoice deleted');
      setDeleteId(null);
      fetchInvoices();
    } catch (err) {
      notify.error('Delete failed');
    }
  };

  const handleExportPDF = async (id) => {
    try {
      const { data } = await api.get(`/invoices/${id}`);
      exportInvoicePDF(data);
      notify.success('PDF exported');
    } catch (err) {
      notify.error('PDF export failed');
    }
  };

  const handleExportExcel = async (id) => {
    try {
      const { data } = await api.get(`/invoices/${id}`);
      exportSingleInvoiceExcel(data);
      notify.success('Excel exported');
    } catch (err) {
      notify.error('Excel export failed');
    }
  };

  const handleExportAllExcel = () => {
    if (invoices.length === 0) {
      notify.error('No data to export');
      return;
    }
    exportInvoicesExcel(invoices);
    notify.success('Excel exported');
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString() : '-';

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1>Invoices</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={handleExportAllExcel}>
             Export List to Excel
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/invoices/new')} id="new-invoice-btn">
            <Plus size={18} /> New Invoice
          </button>
        </div>
      </div>
      <div className="search-bar mb-4">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input type="text" className="form-input" placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} id="invoice-search" />
        </div>
      </div>
      <div className="data-table-wrapper glass-card" style={{ padding: 0 }}>
        {invoices.length > 0 ? (
          <table className="data-table">
            <thead><tr><th>Invoice #</th><th>Serial #</th><th>Date</th><th>Importer</th><th>Bayan Number</th><th>Income</th><th>Payments</th><th>Profit</th><th>Actions</th></tr></thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv._id}>
                  <td className="font-mono">{inv.invoiceNumber}</td>
                  <td className="font-mono" style={{ color: 'var(--accent-violet)' }}>{inv.serialNumber || '-'}</td>
                  <td>{fmt(inv.date)}</td>
                  <td>{inv.importerName}</td>
                  <td>{inv.bayan}</td>
                  <td className="text-success">{formatCurrency(inv.totalIncome)}</td>
                  <td className="text-warning">{formatCurrency(inv.totalPayments)}</td>
                  <td className={((inv.totalIncome || 0) - (inv.toHassan || 0)) >= 0 ? 'text-success' : 'text-danger'}>{formatCurrency((inv.totalIncome || 0) - (inv.toHassan || 0))}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-ghost btn-icon" onClick={() => navigate(`/invoices/${inv._id}`)}><Eye size={16} /></button>
                      <button className="btn btn-ghost btn-icon" onClick={() => navigate(`/invoices/edit/${inv._id}`)}><Edit size={16} /></button>
                      <button className="btn btn-ghost btn-icon" onClick={() => handleExportPDF(inv._id)} title="Export PDF"><FileDown size={16} /></button>
                      <button className="btn btn-ghost btn-icon" onClick={() => handleExportExcel(inv._id)} title="Export Excel"><FileDown size={16} color="green" /></button>
                      <button className="btn btn-ghost btn-icon text-danger" onClick={() => setDeleteId(inv._id)} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state"><FileDown size={48} className="empty-icon" /><h3>No invoices found</h3><p className="text-muted">Create your first invoice to get started</p></div>
        )}
      </div>
      <Modal isOpen={!!deleteId} title="Delete Invoice" message="Delete this invoice and all related data?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} confirmText="Delete" danger />
    </div>
  );
};

export default InvoiceList;
