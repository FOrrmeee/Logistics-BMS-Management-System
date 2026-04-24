import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, FileText, Ship, Container, Receipt } from 'lucide-react';
import api from '../../services/api';
import { useNotify } from '../../context/NotificationContext';
import { useCurrency } from '../../context/CurrencyContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const InvoiceForm = () => {
  const { formatCurrency } = useCurrency();
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const notify = useNotify();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [importers, setImporters] = useState([]);
  const [terminals, setTerminals] = useState([]);

  const [invoice, setInvoice] = useState({ date: '', invoiceNumber: '', serialNumber: '', importerName: '', bayan: '', customsClearanceIncome: 0, transportIncome: 0, totalIncome: 0, toHassan: 0 });
  const [shipment, setShipment] = useState({ manifestNumber: '', manifestDate: '', manifestType: '', billNumber: '', terminal: '' });
  const [container, setContainer] = useState({ containerNumber: '', size: '', numberOfContainers: 1, country: '' });
  const [expense, setExpense] = useState({ agentFees: 0, portFees: 0, wagesPortsAuthority: 0, appointmentFees: 0, fines: 0, transferToAgent: 0 });

  // Auto-calculate totals
  const totalPayments = Object.values(expense).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
  const autoTotalIncome = (parseFloat(invoice.customsClearanceIncome) || 0) + (parseFloat(invoice.transportIncome) || 0);
  const totalInvoice = totalPayments + autoTotalIncome;
  const totalProfit = autoTotalIncome - (parseFloat(invoice.toHassan) || 0);

  useEffect(() => {
    if (isEdit) {
      loadInvoice();
    } else {
      loadNextNumber();
    }
    loadImporters();
    loadTerminals();
  }, [id]);

  const loadImporters = async () => {
    try {
      const { data } = await api.get('/invoices/importers');
      setImporters(data);
    } catch (err) { /* silent */ }
  };

  const loadTerminals = async () => {
    try {
      const { data } = await api.get('/shipments/terminals');
      setTerminals(data);
    } catch (err) { /* silent */ }
  };

  const loadNextNumber = async () => {
    try {
      const { data } = await api.get('/invoices/next-number');
      setInvoice(prev => ({ ...prev, invoiceNumber: data.invoiceNumber, serialNumber: data.serialNumber, date: new Date().toISOString().slice(0, 10) }));
    } catch (err) { /* use empty */ }
  };

  const loadInvoice = async () => {
    try {
      const { data } = await api.get(`/invoices/${id}`);
      const inv = data.invoice;
      setInvoice({ date: inv.date?.slice(0, 10) || '', invoiceNumber: inv.invoiceNumber, serialNumber: inv.serialNumber || '', importerName: inv.importerName, bayan: inv.bayan, customsClearanceIncome: inv.customsClearanceIncome || 0, transportIncome: inv.transportIncome || 0, totalIncome: inv.totalIncome || 0, toHassan: inv.toHassan || 0 });
      if (inv.shipment) {
        const s = inv.shipment;
        setShipment({ manifestNumber: s.manifestNumber || '', manifestDate: s.manifestDate?.slice(0, 10) || '', manifestType: s.manifestType || '', billNumber: s.billNumber || '', terminal: s.terminal || '' });
      }
      if (data.containers && data.containers.length > 0) {
        const c = data.containers[0];
        setContainer({ containerNumber: c.containerNumber || '', size: c.size || '', numberOfContainers: c.numberOfContainers || 1, country: c.country || '' });
      }
      if (inv.expenses) {
        const e = inv.expenses;
        setExpense({ agentFees: e.agentFees || 0, portFees: e.portFees || 0, wagesPortsAuthority: e.wagesPortsAuthority || 0, appointmentFees: e.appointmentFees || 0, fines: e.fines || 0, transferToAgent: e.transferToAgent || 0 });
      }
    } catch (err) {
      notify.error('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!invoice.importerName || !invoice.bayan || !invoice.date) {
      notify.error('Please fill required fields');
      return;
    }
    setSaving(true);
    try {
      const payload = { invoiceData: { ...invoice, totalIncome: autoTotalIncome }, shipmentData: shipment, containerData: container, expenseData: expense };
      if (isEdit) {
        await api.put(`/invoices/${id}`, payload);
        notify.success('Invoice updated');
      } else {
        await api.post('/invoices', payload);
        notify.success('Invoice created');
      }
      navigate('/invoices');
    } catch (err) {
      notify.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const updateInvoice = (field, val) => setInvoice(p => ({ ...p, [field]: val }));
  const updateShipment = (field, val) => setShipment(p => ({ ...p, [field]: val }));
  const updateContainer = (field, val) => setContainer(p => ({ ...p, [field]: val }));
  const updateExpense = (field, val) => setExpense(p => ({ ...p, [field]: val }));

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1>{isEdit ? 'Edit Invoice' : 'New Invoice'}</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/invoices')}><ArrowLeft size={18} /> Back</button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="glass-card" style={{ marginBottom: 24 }}>
          <div className="form-section-title"><FileText size={18} /> Invoice Details</div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                Serial Number <span style={{ fontSize: '0.7rem', background: 'var(--accent-violet)', color: '#fff', padding: '2px 6px', borderRadius: 4 }}>🔒 Auto</span>
              </label>
              <input className="form-input" value={invoice.serialNumber} readOnly style={{ opacity: 0.7, cursor: 'not-allowed', background: 'rgba(139,92,246,0.08)', borderColor: 'var(--accent-violet)' }} placeholder="Auto-generated" tabIndex={-1} />
            </div>
            <div className="form-group"><label className="form-label">Date *</label><input type="date" className="form-input" value={invoice.date} onChange={e => updateInvoice('date', e.target.value)} required /></div>
            <div className="form-group"><label className="form-label">Invoice Number</label><input className="form-input" value={invoice.invoiceNumber} onChange={e => updateInvoice('invoiceNumber', e.target.value)} placeholder="Enter invoice number" /></div>
            <div className="form-group"><label className="form-label">Bayan Number *</label><input className="form-input" value={invoice.bayan} onChange={e => updateInvoice('bayan', e.target.value)} required placeholder="Enter bayan number" /></div>
            <div className="form-group"><label className="form-label">Importer Name *</label>
              <input 
                className="form-input" 
                value={invoice.importerName} 
                onChange={e => updateInvoice('importerName', e.target.value)} 
                required 
                placeholder="Enter importer name" 
                list="importers-list"
              />
              <datalist id="importers-list">
                {importers.map((name, i) => (
                  <option key={i} value={name} />
                ))}
              </datalist>
            </div>
            <div className="form-group"><label className="form-label">Bill of Lading</label><input className="form-input" value={shipment.billNumber} onChange={e => updateShipment('billNumber', e.target.value)} placeholder="Enter bill of lading" /></div>
          </div>
        </div>

        <div className="glass-card" style={{ marginBottom: 24 }}>
          <div className="form-section-title"><Ship size={18} /> Shipment (Manifest)</div>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Manifest Number</label><input className="form-input" value={shipment.manifestNumber} onChange={e => updateShipment('manifestNumber', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Manifest Date</label><input type="date" className="form-input" value={shipment.manifestDate} onChange={e => updateShipment('manifestDate', e.target.value)} /></div>
            <div className="form-group">
              <label className="form-label">Manifest Type</label>
              <select className="form-input" value={shipment.manifestType} onChange={e => updateShipment('manifestType', e.target.value)}>
                <option value="">Select Type</option>
                <option value="Import">Import</option>
                <option value="Export">Export</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Terminal</label>
              <input 
                className="form-input" 
                value={shipment.terminal} 
                onChange={e => updateShipment('terminal', e.target.value)} 
                list="terminals-list"
              />
              <datalist id="terminals-list">
                {terminals.map((name, i) => (
                  <option key={i} value={name} />
                ))}
              </datalist>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ marginBottom: 24 }}>
          <div className="form-section-title"><Container size={18} /> Container</div>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Container Number</label><input className="form-input" value={container.containerNumber} onChange={e => updateContainer('containerNumber', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Size</label><input className="form-input" value={container.size} onChange={e => updateContainer('size', e.target.value)} placeholder="e.g. 20ft, 40ft" /></div>
            <div className="form-group"><label className="form-label">Number of Containers</label><input type="number" className="form-input" value={container.numberOfContainers} onChange={e => updateContainer('numberOfContainers', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Country Origin</label><input className="form-input" value={container.country} onChange={e => updateContainer('country', e.target.value)} /></div>
          </div>
        </div>

        <div className="glass-card" style={{ marginBottom: 24 }}>
          <div className="form-section-title"><Receipt size={18} /> Payments</div>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Agent Fees</label><input type="number" step="any" min="0" className="form-input" value={expense.agentFees} onChange={e => updateExpense('agentFees', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Port Fees</label><input type="number" step="any" min="0" className="form-input" value={expense.portFees} onChange={e => updateExpense('portFees', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Wages Ports Authority</label><input type="number" step="any" min="0" className="form-input" value={expense.wagesPortsAuthority} onChange={e => updateExpense('wagesPortsAuthority', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Appointment Fees</label><input type="number" step="any" min="0" className="form-input" value={expense.appointmentFees} onChange={e => updateExpense('appointmentFees', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Fine</label><input type="number" step="any" min="0" className="form-input" value={expense.fines} onChange={e => updateExpense('fines', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Transfer to Agent</label><input type="number" step="any" min="0" className="form-input" value={expense.transferToAgent} onChange={e => updateExpense('transferToAgent', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
              <label className="form-label">Total Payments</label>
              <input className="form-input" value={totalPayments} readOnly style={{ background: 'var(--bg-secondary)', fontWeight: 'bold', color: 'var(--accent-amber)' }} />
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ marginBottom: 24 }}>
          <div className="form-section-title"><FileText size={18} /> Income</div>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Customs Clearance</label><input type="number" step="any" min="0" className="form-input" value={invoice.customsClearanceIncome} onChange={e => updateInvoice('customsClearanceIncome', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Transport</label><input type="number" step="any" min="0" className="form-input" value={invoice.transportIncome} onChange={e => updateInvoice('transportIncome', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">To Transporter</label><input type="number" step="any" min="0" className="form-input" value={invoice.toHassan} onChange={e => updateInvoice('toHassan', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
              <label className="form-label">Total Income</label>
              <input className="form-input" value={autoTotalIncome} readOnly style={{ background: 'var(--bg-secondary)', fontWeight: 'bold', color: 'var(--accent-emerald)' }} />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="glass-card" style={{ marginBottom: 24 }}>
          <div className="form-section-title">Summary</div>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div><span className="text-muted" style={{ fontSize: '0.8rem' }}>Total Income</span><div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>{formatCurrency(autoTotalIncome)}</div></div>
            <div><span className="text-muted" style={{ fontSize: '0.8rem' }}>Total Payments</span><div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-amber)' }}>{formatCurrency(totalPayments)}</div></div>
            <div><span className="text-muted" style={{ fontSize: '0.8rem' }}>Total Invoice</span><div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-violet)' }}>{formatCurrency(totalInvoice)}</div></div>
            <div><span className="text-muted" style={{ fontSize: '0.8rem' }}>Total Profit</span><div style={{ fontSize: '1.5rem', fontWeight: 700, color: totalProfit >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>{formatCurrency(totalProfit)}</div></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="btn btn-primary" disabled={saving} id="save-invoice-btn">
            <Save size={18} /> {saving ? 'Saving...' : (isEdit ? 'Update Invoice' : 'Create Invoice')}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/invoices')}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
