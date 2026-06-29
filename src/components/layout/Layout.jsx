import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ConfirmModal from '../common/ConfirmModal';
import AlertModal from '../common/AlertModal';
import { useUIStore } from '../../store/useUIStore';

export default function Layout() {
  const { 
    confirmModal, closeConfirm,
    alertModal, closeAlert 
  } = useUIStore();

  return (
    <div className="min-h-screen bg-vybe-dark text-white flex">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-8 overflow-x-hidden">
          {/* Framer motion could be added here for page transitions later */}
          <Outlet />
        </main>
      </div>
      
      <ConfirmModal 
        confirmModal={confirmModal}
        onClose={closeConfirm}
      />
      
      <AlertModal 
        alertModal={alertModal}
        onClose={closeAlert}
      />
    </div>
  );
}
