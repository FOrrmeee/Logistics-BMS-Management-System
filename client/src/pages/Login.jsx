import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotify } from '../context/NotificationContext';
import { Lock, User } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const notify = useNotify();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      notify.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      notify.success('Welcome back!');
      navigate('/');
    } catch (err) {
      notify.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">L</div>
          <h1>Logistics BMS</h1>
          <p className="login-sub">Sign in to your account</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              <User size={14} style={{ display: 'inline', marginRight: 4 }} />
              Username
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder="Enter username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              <Lock size={14} style={{ display: 'inline', marginRight: 4 }} />
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} id="login-submit">
            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
