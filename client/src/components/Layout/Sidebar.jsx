import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Ship,
  Container,
  Receipt,
  LogOut,
  Menu,
  X,
  User,
  Coins,
  Globe
} from 'lucide-react';
import { useState } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { useLanguage } from '../../context/LanguageContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/invoices', icon: <FileText size={20} />, label: 'Invoices' },
    { path: '/containers', icon: <Container size={20} />, label: 'Containers' },
    { path: '/expenses', icon: <Receipt size={20} />, label: 'Payments' },
  ];

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="btn btn-ghost mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 200,
          display: 'none'
        }}
        id="mobile-menu-toggle"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`} id="main-sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-icon">L</div>
          <div>
            <div className="brand-text">Logistics BMS</div>
            <div className="brand-sub">Management System</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <span className="nav-label">Main Menu</span>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
              id={`nav-${item.label.toLowerCase()}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer / Logout */}
        <div className="sidebar-footer">
          <div className="nav-item" style={{ marginBottom: 12 }}>
            <span className="nav-icon"><Globe size={20} /></span>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="form-input"
              style={{ 
                padding: '6px 12px', 
                fontSize: '0.9rem', 
                fontWeight: '600',
                background: 'var(--primary)', 
                color: 'white', 
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                width: '100%'
              }}
            >
              <option value="English" style={{ background: 'var(--bg-secondary)', color: 'white' }}>English</option>
              <option value="Arabic" style={{ background: 'var(--bg-secondary)', color: 'white' }}>Arabic</option>
            </select>
          </div>
          <div className="nav-item" style={{ marginBottom: 12 }}>
            <span className="nav-icon"><Coins size={20} /></span>
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              className="form-input"
              style={{ 
                padding: '6px 12px', 
                fontSize: '0.9rem', 
                fontWeight: '600',
                background: 'var(--primary)', 
                color: 'white', 
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                width: '100px'
              }}
            >
              <option value="$" style={{ background: 'var(--bg-secondary)', color: 'white' }}>$ (USD)</option>
              <option value="€" style={{ background: 'var(--bg-secondary)', color: 'white' }}>€ (EUR)</option>
              <option value="£" style={{ background: 'var(--bg-secondary)', color: 'white' }}>£ (GBP)</option>
              <option value="SAR" style={{ background: 'var(--bg-secondary)', color: 'white' }}>SAR</option>
              <option value="AED" style={{ background: 'var(--bg-secondary)', color: 'white' }}>AED</option>
              <option value="Rs" style={{ background: 'var(--bg-secondary)', color: 'white' }}>Rs (INR)</option>
            </select>
          </div>
          <button className="nav-item" onClick={handleLogout} id="logout-btn" style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}>
            <span className="nav-icon"><LogOut size={20} /></span>
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99,
            display: 'none'
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-toggle { display: flex !important; }
          .sidebar + div[style] { display: block !important; }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
