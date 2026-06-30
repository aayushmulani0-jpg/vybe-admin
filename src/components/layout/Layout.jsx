import { Outlet } from 'react-router-dom';
import { Layout as AntLayout, Modal } from 'antd';
import Sidebar from './Sidebar';
import Header from './Header';
import { useUIStore } from '../../store/useUIStore';

const { Content } = AntLayout;

export default function Layout() {
  const { 
    confirmModal, closeConfirm,
    alertModal, closeAlert 
  } = useUIStore();

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <AntLayout style={{ marginLeft: 256 }}>
        <Header />
        <Content style={{ padding: '24px 32px', overflow: 'initial', minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </AntLayout>
      
      {/* Confirm Modal */}
      <Modal
        open={!!confirmModal}
        onCancel={() => {
          if (confirmModal?.onCancel) confirmModal.onCancel();
          closeConfirm();
        }}
        onOk={() => {
          if (confirmModal?.onConfirm) confirmModal.onConfirm();
          closeConfirm();
        }}
        okText={confirmModal?.confirmText || 'Confirm'}
        cancelText={confirmModal?.cancelText || 'Cancel'}
        title={confirmModal?.title || 'Confirm'}
        centered
        styles={{
          content: {  border: '1px solid #333' },
          header: { },
          title: { }
        }}
        okButtonProps={{ type: 'primary', danger: confirmModal?.confirmText?.toLowerCase() === 'delete', style: confirmModal?.confirmText?.toLowerCase() !== 'delete' ? { color: '#000', fontWeight: 600 } : {} }}
        cancelButtonProps={{ style: { backgroundColor: 'transparent'} }}
      >
        <p style={{ color: '#ccc', margin: '16px 0' }}>{confirmModal?.message}</p>
      </Modal>
      
      {/* Alert Modal */}
      <Modal
        open={!!alertModal}
        onCancel={closeAlert}
        onOk={closeAlert}
        title={alertModal?.title || (alertModal?.type === 'error' ? 'Error' : alertModal?.type === 'success' ? 'Success' : 'Information')}
        centered
        styles={{
          content: {  border: '1px solid #333' },
          header: { },
          title: { }
        }}
        okButtonProps={{ type: 'primary', style: { color: '#000', fontWeight: 600 } }}
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <p style={{ color: '#ccc', margin: '16px 0' }}>{alertModal?.message}</p>
      </Modal>
    </AntLayout>
  );
}
