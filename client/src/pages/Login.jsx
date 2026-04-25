import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotify } from '../context/NotificationContext';
import { Lock, User } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const notify = useNotify();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      notify.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      notify.success('Welcome back!');
      navigate('/');
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      notify.success('Welcome back!');
      navigate('/');
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Google login failed');
    } finally {
      setGoogleLoading(false);
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
            <label className="form-label" htmlFor="email">
              <User size={14} style={{ display: 'inline', marginRight: 4 }} />
              Email / Username
            </label>
            <input
              id="email"
              type="text"
              className="form-input"
              placeholder="Email or Username"
              value={email}
              onChange={e => setEmail(e.target.value)}
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

          <button type="submit" className="btn btn-primary" disabled={loading || googleLoading} id="login-submit">
            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span> : 'Sign In with Email'}
          </button>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <button 
            type="button" 
            className="btn-google" 
            onClick={handleGoogleLogin} 
            disabled={loading || googleLoading}
            id="google-login"
          >
            {googleLoading ? (
              <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
                  <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
                  <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
                  <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
