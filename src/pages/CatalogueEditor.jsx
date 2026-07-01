import { useState, useEffect } from 'react';
import { useCatalogueStore } from '../store/useCatalogueStore';
import { useProductStore } from '../store/useProductStore';
import { BookOpen, Trash2, Plus, CheckCircle, Globe, X, ArrowLeft, Settings2, Settings, Search } from 'lucide-react';
import WholesalePrintSettingsModal from '../components/catalogue/WholesalePrintSettingsModal';
import { Table, Card, Input, Button, Tag, Typography, Row, Col, Empty, Modal } from 'antd';

const { Title, Text } = Typography;

const EditableWholesalePriceInput = ({ selectedCatId, item, updateCatalogueItem }) => {
  const [val, setVal] = useState(item.wholesalePrice || '');
  useEffect(() => setVal(item.wholesalePrice || ''), [item.wholesalePrice]);
  const handleBlur = () => {
    const newPrice = Number(val);
    if (newPrice !== item.wholesalePrice) {
      updateCatalogueItem(selectedCatId, item.productId, { wholesalePrice: newPrice });
    }
  };
  return (
    <Input 
      type="number" 
      value={val} 
      onChange={(e) => setVal(e.target.value)} 
      onBlur={handleBlur} 
      onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} 
      style={{ width: '100px' }} 
    />
  );
};

const EditableMoqInput = ({ selectedCatId, item, updateCatalogueItem }) => {
  const [val, setVal] = useState(item.moq || '');
  useEffect(() => setVal(item.moq || ''), [item.moq]);
  const handleBlur = () => {
    const newMoq = Number(val);
    if (newMoq !== item.moq) {
      updateCatalogueItem(selectedCatId, item.productId, { moq: newMoq });
    }
  };
  return (
    <Input 
      type="number" 
      value={val} 
      onChange={(e) => setVal(e.target.value)} 
      onBlur={handleBlur} 
      onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} 
      style={{ width: '80px' }} 
    />
  );
};

export default function CatalogueEditor() {
  const { catalogues, fetchCatalogues, createCatalogue, setLiveCatalogue, setOfflineCatalogue, deleteCatalogue, addCatalogueItem, removeCatalogueItem, updateCatalogueItem, updateWholesalePrintSettings, saveCatalogue, isLoading } = useCatalogueStore();
  const { products: globalProducts, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchCatalogues();
    fetchProducts();
  }, [fetchCatalogues, fetchProducts]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Master-Detail state
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showPrintSettingsModal, setShowPrintSettingsModal] = useState(false);

  const selectedCat = catalogues.find(c => c.id === selectedCatId);

  const handleCreate = () => {
    if (!newCatName.trim()) return;
    createCatalogue(newCatName);
    setNewCatName('');
    setShowCreateModal(false);
  };

  // --- DETAIL VIEW ---
  if (selectedCat) {
    const detailColumns = [
      {
        title: 'Product',
        key: 'product',
        render: (_, item) => {
          const globalProd = globalProducts.find(p => p.id === item.productId);
          if (!globalProd) return null;
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={globalProd.image} alt={globalProd.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
              <div>
                <Text strong style={{  display: 'block' }}>{globalProd.name}</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>Retail: ₹{globalProd.price}</Text>
              </div>
            </div>
          );
        }
      },
      {
        title: 'Wholesale Price (₹)',
        key: 'wholesalePrice',
        render: (_, item) => (
          <EditableWholesalePriceInput selectedCatId={selectedCat.id} item={item} updateCatalogueItem={updateCatalogueItem} />
        )
      },
      {
        title: 'MOQ',
        key: 'moq',
        render: (_, item) => (
          <EditableMoqInput selectedCatId={selectedCat.id} item={item} updateCatalogueItem={updateCatalogueItem} />
        )
      },
      {
        title: 'Actions',
        key: 'actions',
        align: 'right',
        render: (_, item) => (
          <Button 
            type="text" 
            danger
            icon={<Trash2 size={16} />}
            onClick={() => removeCatalogueItem(selectedCat.id, item.productId)}
          />
        )
      }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button 
              type="text" 
              icon={<ArrowLeft size={20} />} 
              onClick={() => setSelectedCatId(null)}
              
            />
            <div>
              <Title level={4} style={{  margin: 0, marginBottom: '4px' }}>{selectedCat.name}</Title>
              <Text type="secondary">Manage products, MOQs, wholesale pricing, and custom print matrix.</Text>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button type="primary" onClick={() => saveCatalogue(selectedCat.id)} icon={<CheckCircle size={16} />} style={{ fontWeight: 600, color: '#000' }}>
              Save Draft
            </Button>
            <Button danger onClick={() => { deleteCatalogue(selectedCat.id); setSelectedCatId(null); }} icon={<Trash2 size={16} />}>
              Delete
            </Button>
            {selectedCat.isLive ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag color="lime" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 12px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  <Globe size={12} /> Live
                </Tag>
                <Button type="default" onClick={() => setOfflineCatalogue(selectedCat.id)} style={{ backgroundColor: 'transparent'}}>
                  Take Offline
                </Button>
              </div>
            ) : (
              <Button type="default" onClick={() => {
                saveCatalogue(selectedCat.id).then(() => setLiveCatalogue(selectedCat.id));
              }} style={{  borderColor: '#a3ff12', color: '#a3ff12' }}>
                Publish as Live
              </Button>
            )}
          </div>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} xl={16}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={5} style={{  margin: 0 }}>Catalogue Products</Title>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button type="default" icon={<Settings size={16} />} onClick={() => setShowPrintSettingsModal(true)} style={{ backgroundColor: 'transparent'}}>
                    Manage Wholesale Print Settings
                  </Button>
                  <Button type="primary" icon={<Plus size={16} />} onClick={() => setShowProductSelector(true)} style={{ fontWeight: 600, color: '#000' }}>
                    Browse Products
                  </Button>
                </div>
              </div>

              <Card  bodyStyle={{ padding: 0 }}>
                <Table 
                  columns={detailColumns}
                  dataSource={selectedCat.items}
                  rowKey="productId"
                  pagination={false}
                  loading={isLoading}
                  locale={{
                    emptyText: <Empty description="No products added to this catalogue." image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  }}
                />
              </Card>
            </div>
          </Col>
        </Row>

        {/* Product Selector Modal */}
        <Modal
          title="Select Products to Add"
          open={showProductSelector}
          onCancel={() => setShowProductSelector(false)}
          footer={null}
          width={600}
          styles={{ 
            body: { maxHeight: '60vh', overflowY: 'auto' },
            content: { },
            header: {  borderBottom: '1px solid #333' }}}
          closeIcon={<X size={20} color="#888" />}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
            {globalProducts.map(prod => {
              const isAdded = selectedCat.items.some(item => item.productId === prod.id);
              return (
                <div key={prod.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px',  borderRadius: '8px', border: '1px solid #333' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={prod.image} alt={prod.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                    <div>
                      <Text strong style={{  display: 'block' }}>{prod.name}</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>Retail: ₹{prod.price}</Text>
                    </div>
                  </div>
                  <Button
                    type={isAdded ? 'default' : 'primary'}
                    disabled={isAdded}
                    onClick={() => addCatalogueItem(selectedCat.id, prod.id, Math.floor(prod.price * 0.6))}
                    style={!isAdded ? { fontWeight: 600, color: '#000' } : { backgroundColor: 'transparent'}}
                  >
                    {isAdded ? 'Added' : 'Add to Catalogue'}
                  </Button>
                </div>
              );
            })}
          </div>
        </Modal>

        {/* Wholesale Print Settings Modal */}
        {showPrintSettingsModal && (
          <WholesalePrintSettingsModal
            catalogue={selectedCat}
            onSave={(locations, templates) => {
              updateWholesalePrintSettings(selectedCat.id, locations, templates);
              setShowPrintSettingsModal(false);
            }}
            onClose={() => setShowPrintSettingsModal(false)}
          />
        )}
      </div>
    );
  }

  const filteredCatalogues = catalogues.filter((cat) => {
    return cat.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // --- MASTER VIEW ---
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Title level={4} style={{  margin: 0, marginBottom: '4px' }}>Wholesale Catalogues</Title>
          <Text type="secondary">Manage your product catalogues. Only one catalogue can be live for buyers to order.</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Input 
            prefix={<Search size={16}  />} 
            placeholder="Search catalogues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '256px'}}
          />
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setShowCreateModal(true)} style={{ fontWeight: 600, color: '#000' }}>
            Create Catalogue
          </Button>
        </div>
      </div>

      {catalogues.length === 0 && !showCreateModal && !isLoading && (
        <Card bodyStyle={{ padding: '80px 0' }}>
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '16px', fontWeight: 600 }}>No Catalogues Found</span>
                <span style={{ color: '#888', maxWidth: '400px' }}>You haven't created any wholesale catalogues yet. Create your first catalogue to start adding products and print matrices.</span>
              </div>
            }
          >
            <Button type="primary" icon={<Plus size={16} />} onClick={() => setShowCreateModal(true)} style={{ fontWeight: 600, color: '#000', marginTop: '16px' }}>
              Create First Catalogue
            </Button>
          </Empty>
        </Card>
      )}

      {filteredCatalogues.length > 0 && (
        <Row gutter={[24, 24]}>
          {filteredCatalogues.map((cat) => (
            <Col xs={24} md={12} lg={8} key={cat.id}>
              <Card 
                style={{ 
                   
                  borderColor: cat.isLive ? '#a3ff12' : '#333',
                  boxShadow: cat.isLive ? '0 0 20px rgba(163,255,18,0.1)' : 'none',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                bodyStyle={{ padding: '24px' }}
              >
                {cat.isLive && (
                  <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#a3ff12', color: '#000', fontSize: '10px', fontWeight: 'bold', padding: '4px 12px', borderBottomLeftRadius: '8px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Globe size={12} /> Live
                  </div>
                )}
                
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'inline-flex', padding: '12px',  borderRadius: '12px', border: '1px solid #333' }}>
                    <BookOpen size={24} color={cat.isLive ? '#a3ff12' : '#888'} />
                  </div>
                </div>

                <Title level={5} style={{  margin: 0, marginBottom: '4px' }}>{cat.name}</Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: '24px', fontSize: '14px' }}>
                  Created: {cat.dateCreated} • {cat.items?.length || 0} Products
                </Text>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '16px', borderTop: '1px solid #333' }}>
                  <Button 
                    type="primary" 
                    icon={<Settings2 size={16} />} 
                    onClick={() => setSelectedCatId(cat.id)}
                    style={{ flex: 1, fontWeight: 600, color: '#000' }}
                  >
                    Configure
                  </Button>
                  <Button 
                    type="text" 
                    danger 
                    icon={<Trash2 size={20} />} 
                    onClick={() => deleteCatalogue(cat.id)}
                  />
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Create Modal */}
      <Modal
        title="Create New Catalogue"
        open={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        footer={null}
        styles={{ 
          content: { },
          header: {  borderBottom: '1px solid #333' }}}
        closeIcon={<X size={20} color="#888" />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          <div>
            <Text style={{  display: 'block', marginBottom: '8px' }}>Catalogue Name</Text>
            <Input 
              placeholder="e.g. Winter 2026 Collection" 
              value={newCatName} 
              onChange={(e) => setNewCatName(e.target.value)} 
              autoFocus
              
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <Button type="default" block onClick={() => setShowCreateModal(false)} style={{ backgroundColor: 'transparent'}}>
              Cancel
            </Button>
            <Button type="primary" block onClick={handleCreate} style={{ fontWeight: 600, color: '#000' }}>
              Create Draft
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
