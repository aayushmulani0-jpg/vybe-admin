import { useProductStore } from '../store/useProductStore';
import GlassCard from '../components/common/GlassCard';
import { ShoppingBag, Tag } from 'lucide-react';

export default function Products() {
  const products = useProductStore((state) => state.products);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Products Catalog</h1>
          <p className="text-sm text-gray-400">View your active product listings on the store.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <GlassCard key={product.id} className="overflow-hidden group">
            <div className="relative aspect-[4/5] bg-vybe-dark">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Badges Overlay */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.discountBadge && (
                  <span className="bg-vybe-neon text-vybe-dark text-xs font-bold px-2 py-1 rounded shadow-[0_0_10px_rgba(163,255,18,0.3)] flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {product.discountBadge}
                  </span>
                )}
                {product.stockStatus === 'Out of Stock' && (
                  <span className="bg-red-500/90 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-vybe-glassBorder">
              <h3 className="font-semibold text-white mb-2 line-clamp-1">{product.name}</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-vybe-neon font-bold">₹{product.price}</span>
                  {product.comparePrice && (
                    <span className="text-gray-500 text-sm line-through">₹{product.comparePrice}</span>
                  )}
                </div>
                <button className="p-2 bg-vybe-dark rounded-full hover:bg-vybe-glassBorder transition-colors text-gray-300 hover:text-white">
                  <ShoppingBag className="w-4 h-4" />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
