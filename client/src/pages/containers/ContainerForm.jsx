import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Container as ContainerIcon } from 'lucide-react';
import api from '../../services/api';
import { useNotify } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ContainerForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const notify = useNotify();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [container, setContainer] = useState({ bayan: '', containerNumber: '', size: '', numberOfContainers: 1, country: '', customer: '' });
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
      const fetchContainer = async () => {
        try {
          const { data } = await api.get(`/containers/${id}`);
          setContainer({
            containerNumber: data.containerNumber || '',
            size: data.size || '',
            numberOfContainers: data.numberOfContainers || 1,
            country: data.country || '',
            bayan: data.bayan || '',
            customer: data.customer || ''
          });
        } catch (err) {
          notify.error('Failed to load container');
          navigate('/containers');
        } finally {
          setLoading(false);
        }
      };
      fetchContainer();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/containers/${id}`, container);
        notify.success('Container updated');
      } else {
        await api.post('/containers', container);
        notify.success('Container created');
      }
      navigate('/containers');
    } catch (err) {
      notify.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, val) => setContainer(p => ({ ...p, [field]: val }));

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1>{isEdit ? 'Edit Container' : 'New Container'}</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/containers')}><ArrowLeft size={18} /> Back</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="glass-card" style={{ marginBottom: 24 }}>
          <div className="form-section-title"><ContainerIcon size={18} /> Container Details</div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Bayan Number</label>
              <input 
                className="form-input" 
                value={container.bayan} 
                onChange={e => updateField('bayan', e.target.value)} 
                placeholder="Enter bayan number" 
                list="bayan-list"
              />
              <datalist id="bayan-list">
                {bayans.map((b, i) => <option key={i} value={b} />)}
              </datalist>
            </div>
            <div className="form-group"><label className="form-label">Container Number *</label><input required className="form-input" value={container.containerNumber} onChange={e => updateField('containerNumber', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Customer</label><input className="form-input" value={container.customer} onChange={e => updateField('customer', e.target.value)} placeholder="Enter customer name" /></div>
            <div className="form-group"><label className="form-label">Size *</label><input required className="form-input" value={container.size} onChange={e => updateField('size', e.target.value)} placeholder="e.g. 20ft, 40ft" /></div>
            <div className="form-group"><label className="form-label">Number of Containers *</label><input required type="number" className="form-input" value={container.numberOfContainers} onChange={e => updateField('numberOfContainers', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Country Origin *</label><input required className="form-input" value={container.country} onChange={e => updateField('country', e.target.value)} /></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}><Save size={18} /> {saving ? 'Saving...' : 'Save Container'}</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/containers')}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ContainerForm;
