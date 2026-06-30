import React, { useState, useRef, useEffect } from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

// Mock T-Shirt Image URL (Plain Black)
const TSHIRT_MOCKUP = "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800"; 

export default function PrintAreaSelector({ value, onChange }) {
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setStartPos({ x, y });
    setIsDrawing(true);
    onChange({ top: y, left: x, width: 0, height: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Clamp to 0-100%
    const clampedX = Math.max(0, Math.min(100, currentX));
    const clampedY = Math.max(0, Math.min(100, currentY));

    const left = Math.min(startPos.x, clampedX);
    const top = Math.min(startPos.y, clampedY);
    const width = Math.abs(clampedX - startPos.x);
    const height = Math.abs(clampedY - startPos.y);

    onChange({ top, left, width, height });
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    // Ensure minimum size so it doesn't disappear on click
    if (value && (value.width < 2 || value.height < 2)) {
       onChange({
         top: value.top,
         left: value.left,
         width: Math.max(value.width, 10),
         height: Math.max(value.height, 10)
       });
    }
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [value, isDrawing]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Text type="secondary" style={{ fontSize: '13px' }}>
        Click and drag on the t-shirt to define the printing area bounds.
      </Text>
      
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        style={{ 
          position: 'relative', 
          width: '100%', 
          maxWidth: '400px', 
          margin: '0 auto', 
          cursor: 'crosshair',
          border: '1px solid #333',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#111'
        }}
        draggable={false}
      >
        <img 
          src={TSHIRT_MOCKUP} 
          alt="T-Shirt Mockup" 
          style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none', userSelect: 'none' }}
          draggable={false}
        />

        {value && value.width > 0 && value.height > 0 && (
          <div 
            style={{
              position: 'absolute',
              top: `${value.top}%`,
              left: `${value.left}%`,
              width: `${value.width}%`,
              height: `${value.height}%`,
              border: '2px dashed #a3ff12',
              backgroundColor: 'rgba(163, 255, 18, 0.2)',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>

      {value && (
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Text code>Top: {value.top?.toFixed(1)}%</Text>
          <Text code>Left: {value.left?.toFixed(1)}%</Text>
          <Text code>Width: {value.width?.toFixed(1)}%</Text>
          <Text code>Height: {value.height?.toFixed(1)}%</Text>
        </div>
      )}
    </div>
  );
}
