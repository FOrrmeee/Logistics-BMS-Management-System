import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useNotify } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const ContainerList = () => {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();
  const notify = useNotify();

  const fetchContainers = async () => {
    try {
      const { data } = await api.get('/containers');
      setContainers(data);
    } catch (err) {
      notify.error('Failed to load containers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContainers(); }, []);

  const handleDelete = async () => {
    try {
      await api.delete(`/containers/${deleteId}`);
      notify.success('Container deleted');
      setDeleteId(null);
      fetchContainers();
    } catch (err) {
      notify.error('Delete failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1>Containers</h1>
        <button className="btn btn-primary" onClick={() => navigate('/containers/new')}>
          <Plus size={18} /> New Container
        </button>
      </div>

      <div className="data-table-wrapper glass-card" style={{ padding: 0 }}>
        {containers.length > 0 ? (
          <table className="data-table">
            <thead><tr><th>Bayan Number</th><th>Container #</th><th>Customer</th><th>Size</th><th>Count</th><th>Country Origin</th><th>Actions</th></tr></thead>
            <tbody>
              {containers.map(c => (
                <tr key={c._id}>
                  <td>{c.bayan || <span className="text-muted">-</span>}</td>
                  <td className="font-mono">{c.containerNumber}</td>
                  <td>{c.customer || <span className="text-muted">-</span>}</td>
                  <td>{c.size}</td>
                  <td>{c.numberOfContainers}</td>
                  <td>{c.country}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-ghost btn-icon" onClick={() => navigate(`/containers/edit/${c._id}`)}><Edit size={16} /></button>
                      <button className="btn btn-ghost btn-icon text-danger" onClick={() => setDeleteId(c._id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state"><h3>No containers found</h3><p className="text-muted">Create standalone or via an invoice.</p></div>
        )}
      </div>

      <Modal isOpen={!!deleteId} title="Delete Container" message="Are you sure you want to delete this container?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} confirmText="Delete" danger />
    </div>
  );
};

export default ContainerList;
