import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useNotify } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const ShipmentList = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();
  const notify = useNotify();

  const fetchShipments = async () => {
    try {
      const { data } = await api.get('/shipments');
      setShipments(data);
    } catch (err) {
      notify.error('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShipments(); }, []);

  const handleDelete = async () => {
    try {
      await api.delete(`/shipments/${deleteId}`);
      notify.success('Shipment deleted');
      setDeleteId(null);
      fetchShipments();
    } catch (err) {
      notify.error('Delete failed');
    }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '-';

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1>Shipments</h1>
        <button className="btn btn-primary" onClick={() => navigate('/shipments/new')}>
          <Plus size={18} /> New Shipment
        </button>
      </div>

      <div className="data-table-wrapper glass-card" style={{ padding: 0 }}>
        {shipments.length > 0 ? (
          <table className="data-table">
            <thead><tr><th>Manifest #</th><th>Date</th><th>Type</th><th>Bill of Lading</th><th>Port</th><th>Terminal</th><th>Actions</th></tr></thead>
            <tbody>
              {shipments.map(s => (
                <tr key={s._id}>
                  <td className="font-mono">{s.manifestNumber}</td>
                  <td>{fmtDate(s.manifestDate)}</td>
                  <td>{s.manifestType}</td>
                  <td>{s.billNumber}</td>
                  <td>{s.registrationPort}</td>
                  <td>{s.terminal}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-ghost btn-icon" onClick={() => navigate(`/shipments/edit/${s._id}`)}><Edit size={16} /></button>
                      <button className="btn btn-ghost btn-icon text-danger" onClick={() => setDeleteId(s._id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state"><h3>No shipments found</h3><p className="text-muted">Create a shipment standalone or via an invoice.</p></div>
        )}
      </div>

      <Modal isOpen={!!deleteId} title="Delete Shipment" message="Are you sure you want to delete this shipment?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} confirmText="Delete" danger />
    </div>
  );
};

export default ShipmentList;
