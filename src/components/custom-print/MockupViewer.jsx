export default function MockupViewer({ order }) {
  if (!order) return null;

  // Determine design positioning based on location string
  const getPositionStyles = (location) => {
    switch (location) {
      case 'Front Center':
      case 'Back Center':
        return { top: '35%', left: '50%', transform: 'translate(-50%, 0)', width: '30%' };
      case 'Left Chest':
        return { top: '30%', left: '62%', transform: 'translate(-50%, 0)', width: '12%' };
      case 'Right Leg Pocket':
        return { top: '60%', left: '35%', transform: 'translate(-50%, 0)', width: '15%' };
      default:
        return { top: '40%', left: '50%', transform: 'translate(-50%, -50%)', width: '25%' }; // Center default
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-vybe-dark rounded-xl border border-vybe-glassBorder">
      
      {/* Viewport Toolbar */}
      <div className="w-full flex justify-between items-center mb-6">
        <h3 className="font-semibold text-white">Live Mockup Preview</h3>
        <div className="text-xs text-vybe-neon font-mono bg-vybe-neon/10 px-3 py-1 rounded-full border border-vybe-neon/30">
          {order.printLocation}
        </div>
      </div>

      {/* Mockup Canvas */}
      <div className="relative w-full max-w-sm aspect-[3/4] bg-neutral-900 rounded-lg overflow-hidden flex items-center justify-center border border-dashed border-gray-700">
        
        {/* Base Garment Vector (Dynamic Color) */}
        <svg 
          viewBox="0 0 200 250" 
          className="absolute inset-0 w-full h-full drop-shadow-2xl transition-colors duration-300"
          style={{ color: order.color || '#ffffff' }}
        >
          <path 
            fill="currentColor" 
            d="M 60 20 Q 100 40 140 20 L 190 60 L 160 100 L 150 90 L 150 230 L 50 230 L 50 90 L 40 100 L 10 60 Z"
          />
          {/* Subtle shading to make it look less flat */}
          <path 
            fill="black" fillOpacity="0.1"
            d="M 60 20 Q 100 40 140 20 L 150 40 Q 100 60 50 40 Z"
          />
        </svg>

        {/* The Uploaded Design (Positioned) */}
        <div 
          className="absolute border border-vybe-neon/50 border-dashed bg-black/10 backdrop-blur-sm shadow-[0_0_15px_rgba(163,255,18,0.2)]"
          style={getPositionStyles(order.printLocation)}
        >
          <img 
            src={order.designUrl} 
            alt="Customer Design" 
            className="w-full h-auto drop-shadow-md"
          />
          
          {/* Dimension Helper */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-vybe-neon whitespace-nowrap bg-black/80 px-2 rounded">
            {order.dimensions}
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500 text-center">
        This preview reflects the placement coordinates submitted by the customer.
      </p>
    </div>
  );
}
