import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/Layout/AppLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InvoiceList from './pages/invoices/InvoiceList';
import InvoiceForm from './pages/invoices/InvoiceForm';
import InvoiceView from './pages/invoices/InvoiceView';

import ShipmentList from './pages/shipments/ShipmentList';
import ShipmentForm from './pages/shipments/ShipmentForm';
import ContainerList from './pages/containers/ContainerList';
import ContainerForm from './pages/containers/ContainerForm';
import ExpenseList from './pages/expenses/ExpenseList';
import ExpenseForm from './pages/expenses/ExpenseForm';
import AccountPart from './pages/AccountPart';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        
        {/* Invoices */}
        <Route path="invoices" element={<InvoiceList />} />
        <Route path="invoices/new" element={<InvoiceForm />} />
        <Route path="invoices/edit/:id" element={<InvoiceForm />} />
        <Route path="invoices/:id" element={<InvoiceView />} />
        
        {/* Other Modules */}
        <Route path="shipments" element={<ShipmentList />} />
        <Route path="shipments/new" element={<ShipmentForm />} />
        <Route path="shipments/edit/:id" element={<ShipmentForm />} />
        
        <Route path="containers" element={<ContainerList />} />
        <Route path="containers/new" element={<ContainerForm />} />
        <Route path="containers/edit/:id" element={<ContainerForm />} />
        
        <Route path="expenses" element={<ExpenseList />} />
        <Route path="expenses/new" element={<ExpenseForm />} />
        <Route path="expenses/edit/:id" element={<ExpenseForm />} />

        <Route path="this-part-of-the-account" element={<AccountPart />} />
      </Route>
    </Routes>
  );
}

export default App;
