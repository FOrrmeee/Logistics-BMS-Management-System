import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Ship } from 'lucide-react';
import api from '../../services/api';
import { useNotify } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ShipmentForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const notify = useNotify();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [shipment, setShipment] = useState({ manifestNumber: '', manifestDate: '', manifestType: '', billNumber: '', registrationPort: '', terminal: '' });

  useEffect(() => {
    if (isEdit) {
      const fetchShipment = async () => {
        try {
          const { data } = await api.get(`/shipments/${id}`);
          setShipment({
            manifestNumber: data.manifestNumber || '',
            manifestDate: data.manifestDate?.slice(0, 10) || '',
            manifestType: data.manifestType || '',
            billNumber: data.billNumber || '',
            registrationPort: data.registrationPort || '',
            terminal: data.terminal || ''
          });
        } catch (err) {
          notify.error('Failed to load shipment');
          navigate('/shipments');
        } finally {
          setLoading(false);
        }
      };
      fetchShipment();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/shipments/${id}`, shipment);
        notify.success('Shipment updated');
      } else {
        await api.post('/shipments', shipment);
        notify.success('Shipment created');
      }
      navigate('/shipments');
    } catch (err) {
      notify.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, val) => setShipment(p => ({ ...p, [field]: val }));

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1>{isEdit ? 'Edit Shipment' : 'New Shipment'}</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/shipments')}><ArrowLeft size={18} /> Back</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="glass-card" style={{ marginBottom: 24 }}>
          <div className="form-section-title"><Ship size={18} /> Shipment Details</div>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Manifest Number *</label><input required className="form-input" value={shipment.manifestNumber} onChange={e => updateField('manifestNumber', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Manifest Date *</label><input required type="date" className="form-input" value={shipment.manifestDate} onChange={e => updateField('manifestDate', e.target.value)} /></div>
            <div className="form-group">
              <label className="form-label">Manifest Type *</label>
              <select required className="form-input" value={shipment.manifestType} onChange={e => updateField('manifestType', e.target.value)}>
                <option value="">Select Type</option>
                <option value="Import">Import</option>
                <option value="Export">Export</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Bill of Lading *</label><input required className="form-input" value={shipment.billNumber} onChange={e => updateField('billNumber', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Registration Port *</label><input required className="form-input" value={shipment.registrationPort} onChange={e => updateField('registrationPort', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Terminal *</label><input required className="form-input" value={shipment.terminal} onChange={e => updateField('terminal', e.target.value)} /></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}><Save size={18} /> {saving ? 'Saving...' : 'Save Shipment'}</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/shipments')}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ShipmentForm;
