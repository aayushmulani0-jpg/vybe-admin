import React from 'react';

const TSHIRT_MOCKUP = "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800";

const PRINT_ZONES = {
  'Left Chest Logo': { top: '30%', left: '60%', width: '10%', height: '10%' },
  '15 × 7 cm Chest Design': { top: '32%', left: '50%', transform: 'translateX(-50%)', width: '20%', height: '10%' },
  'A4 Print': { top: '40%', left: '50%', transform: 'translateX(-50%)', width: '35%', height: '40%' },
  'A3 Print': { top: '35%', left: '50%', transform: 'translateX(-50%)', width: '45%', height: '55%' },
  'Sleeve Print': { top: '45%', left: '25%', width: '15%', height: '20%' },
  'Front + Back Print': { top: '40%', left: '50%', transform: 'translateX(-50%)', width: '35%', height: '40%' }};

export default function MockupViewer({ order }) {
  if (!order) return null;

  const item = order.itemsList && order.itemsList.length > 0 ? order.itemsList[0] : null;
  
  // Extract uploaded images map
  let uploadedImages = {};
  if (item && item.uploadedImages && Object.keys(item.uploadedImages).length > 0) {
    uploadedImages = item.uploadedImages;
  } else if (order.designUrl) {
    // Legacy fallback for single image
    const loc = order.printLocation || 'A4 Print';
    const matchedZone = Object.keys(PRINT_ZONES).find(z => z.toLowerCase() === loc.toLowerCase()) || loc;
    uploadedImages[matchedZone] = order.designUrl;
  }

  const getFallbackStyles = (location) => {
    const loc = location.toLowerCase();
    if (loc.includes('left chest')) return { top: '30%', left: '60%', width: '10%', height: '10%' };
    if (loc.includes('back')) return { top: '40%', left: '50%', transform: 'translateX(-50%)', width: '35%', height: '40%' };
    if (loc.includes('sleeve')) return { top: '45%', left: '25%', width: '15%', height: '20%' };
    return { top: '40%', left: '50%', transform: 'translateX(-50%)', width: '35%', height: '40%' }; // Center default
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-vybe-dark rounded-xl border border-vybe-glassBorder">
      <div className="w-full flex justify-between items-center mb-6">
        <h3 className="font-semibold text-white">Live Mockup Preview</h3>
      </div>

      <div className="relative w-full max-w-sm rounded-lg overflow-hidden flex items-start justify-center border border-white/5 bg-black">
        <div className="relative w-full pointer-events-none">
          <img
            src={TSHIRT_MOCKUP}
            alt="Blank T-Shirt"
            className="w-full h-auto drop-shadow-2xl opacity-90"
          />

          {/* Overlay Zones */}
          {Object.entries(uploadedImages).map(([zoneName, url]) => {
            const zoneStyle = PRINT_ZONES[zoneName] || getFallbackStyles(zoneName);

            return (
              <div
                key={zoneName}
                style={{
                  position: 'absolute',
                  top: zoneStyle.top,
                  left: zoneStyle.left,
                  width: zoneStyle.width,
                  height: zoneStyle.height,
                  transform: zoneStyle.transform}}
                className="border border-vybe-neon/50 border-dashed flex flex-col items-center justify-center overflow-hidden z-20 bg-black/20 backdrop-blur-[1px]"
              >
                <img src={url} alt="Design" className="w-full h-full object-contain pointer-events-auto" />
                {!PRINT_ZONES[zoneName] && (
                  <div className="absolute bottom-0 w-full text-center bg-black/80 text-vybe-neon text-[8px] uppercase font-bold py-0.5 pointer-events-none">
                    {zoneName}
                  </div>
                )}
              </div>
            );
          })}
          
          {Object.keys(uploadedImages).length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-medium">
              No design attached
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500 text-center">
        This preview reflects the uploaded designs placed on the garment.
      </p>
    </div>
  );
}
