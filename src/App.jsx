import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import RetailOrders from './pages/RetailOrders';
import WholesaleOrders from './pages/WholesaleOrders';
import CustomPrint from './pages/CustomPrint';
import CatalogueEditor from './pages/CatalogueEditor';
import Pricing from './pages/Pricing';
import Customers from './pages/Customers';
import Login from './pages/Login';
import Register from './pages/Register';
import Collections from './pages/Collections';
import Banners from './pages/Banners';
import Settings from './pages/Settings';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="retail-orders" element={<RetailOrders />} />
        <Route path="wholesale-orders" element={<WholesaleOrders />} />
        <Route path="custom-print" element={<CustomPrint />} />
        <Route path="catalogues" element={<CatalogueEditor />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="customers" element={<Customers />} />
        <Route path="collections" element={<Collections />} />
        <Route path="banners" element={<Banners />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
