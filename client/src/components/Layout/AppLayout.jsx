import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AppLayout = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-container page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
