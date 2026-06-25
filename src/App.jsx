import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import RetailOrders from './pages/RetailOrders';
import WholesaleOrders from './pages/WholesaleOrders';
import CustomPrint from './pages/CustomPrint';
import CatalogueEditor from './pages/CatalogueEditor';
import Pricing from './pages/Pricing';
import Customers from './pages/Customers';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="retail-orders" element={<RetailOrders />} />
        <Route path="wholesale-orders" element={<WholesaleOrders />} />
        <Route path="custom-print" element={<CustomPrint />} />
        <Route path="catalogues" element={<CatalogueEditor />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="customers" element={<Customers />} />
        {/* We will add other routes here (Settings, etc.) */}
      </Route>
    </Routes>
  );
}

export default App;
