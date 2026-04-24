import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileDown, FileText, Ship, Container, Receipt } from 'lucide-react';
import api from '../../services/api';
import { useNotify } from '../../context/NotificationContext';
import { useCurrency } from '../../context/CurrencyContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { exportInvoicePDF } from '../../utils/pdfExport';
import { exportSingleInvoiceExcel } from '../../utils/excelExport';

const InvoiceView = () => {
  const { formatCurrency } = useCurrency();
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await api.get(`/invoices/${id}`);
        setData(response.data);
      } catch (err) {
        notify.error('Failed to load invoice details');
        navigate('/invoices');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id, navigate, notify]);

  if (loading) return <LoadingSpinner />;
  if (!data || !data.invoice) return <div className="empty-state">Invoice not found</div>;

  const { invoice, shipment, containers, expense } = data;
  const fmt = (d) => d ? new Date(d).toLocaleDateString() : '-';

  return (
    <div>
      <div className="page-header">
        <h1>Invoice Details</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary" onClick={() => exportInvoicePDF(data)}>
            <FileDown size={18} /> Export PDF
          </button>
          <button className="btn btn-primary" onClick={() => exportSingleInvoiceExcel(data)} style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <FileDown size={18} /> Export Excel
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/invoices')}>
            <ArrowLeft size={18} /> Back
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Invoice Number</div>
            <div className="stat-value font-mono" style={{ fontSize: '1.2rem' }}>{invoice.invoiceNumber}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Serial Number</div>
            <div className="stat-value font-mono" style={{ fontSize: '1.2rem', color: 'var(--accent-violet)' }}>{invoice.serialNumber || '-'}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Total Payments</div>
            <div className="stat-value text-warning" style={{ fontSize: '1.2rem' }}>{formatCurrency(invoice.totalPayments)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Total Profit</div>
            <div className={`stat-value ${invoice.totalProfit >= 0 ? 'text-success' : 'text-danger'}`} style={{ fontSize: '1.2rem' }}>
              {formatCurrency(invoice.totalProfit)}
            </div>
          </div>
        </div>
      </div>

      <div className="form-grid">
        <div className="glass-card">
          <div className="form-section-title"><FileText size={18} /> Invoice Info</div>
          <p><strong>Date:</strong> {fmt(invoice.date)}</p>
          <p><strong>Serial Number:</strong> {invoice.serialNumber || '-'}</p>
          <p><strong>Importer:</strong> {invoice.importerName}</p>
          <p><strong>Bayan Number:</strong> {invoice.bayan}</p>
        </div>

        <div className="glass-card">
          <div className="form-section-title"><Ship size={18} /> Shipment Info</div>
          {shipment ? (
            <>
              <p><strong>Manifest #:</strong> {shipment.manifestNumber}</p>
              <p><strong>Date:</strong> {fmt(shipment.manifestDate)}</p>
              <p><strong>Type:</strong> {shipment.manifestType}</p>
              <p><strong>Bill of Lading:</strong> {shipment.billNumber}</p>
              <p><strong>Terminal:</strong> {shipment.terminal}</p>
            </>
          ) : <p className="text-muted">No shipment details</p>}
        </div>

        <div className="glass-card">
          <div className="form-section-title"><Container size={18} /> Container Info</div>
          {containers && containers.length > 0 ? (
            containers.map((c, i) => (
              <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border-color)' }}>
                <p><strong>Container #:</strong> {c.containerNumber}</p>
                <p><strong>Size:</strong> {c.size}</p>
                <p><strong>Count:</strong> {c.numberOfContainers}</p>
                <p><strong>Country:</strong> {c.country}</p>
              </div>
            ))
          ) : <p className="text-muted">No container details</p>}
        </div>

        <div className="glass-card">
          <div className="form-section-title"><Receipt size={18} /> Payments Info</div>
          {expense ? (
            <>
              <p><strong>Agent Fees:</strong> {formatCurrency(expense.agentFees)}</p>
              <p><strong>Port Fees:</strong> {formatCurrency(expense.portFees)}</p>
              <p><strong>Wages:</strong> {formatCurrency(expense.wagesPortsAuthority)}</p>
              <p><strong>Appointment:</strong> {formatCurrency(expense.appointmentFees)}</p>
              <p><strong>Fine:</strong> {formatCurrency(expense.fines)}</p>
              <p><strong>Transfer to Agent:</strong> {formatCurrency(expense.transferToAgent)}</p>
            </>
          ) : <p className="text-muted">No payment details</p>}
        </div>

        <div className="glass-card">
          <div className="form-section-title"><FileText size={18} /> Income Info</div>
          <p><strong>Customs Clearance:</strong> {formatCurrency(invoice.customsClearanceIncome || 0)}</p>
          <p><strong>Transport:</strong> {formatCurrency(invoice.transportIncome || 0)}</p>
          <p><strong>To Transporter:</strong> {formatCurrency(invoice.toHassan || 0)}</p>
          <p style={{ marginTop: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
            <strong>Total Income:</strong> <span className="text-emerald">{formatCurrency(invoice.totalIncome || 0)}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
