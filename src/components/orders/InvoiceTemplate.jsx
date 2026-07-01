import React from 'react';

export default function InvoiceTemplate({ order, documentType = 'INVOICE' }) {
  if (!order) return null;

  const items = order.itemsList || [];

  // Calculate totals
  const subTotal = items.reduce((sum, item) => sum + (item.itemTotal || (item.price * (item.qty || 1))), 0);
  const total = order.total || subTotal;
  const handlingFee = total > subTotal ? total - subTotal : 0;

  const primaryColor = '#111111';
  const secondaryColor = '#444444';
  const borderColor = '#dddddd';

  return (
    <div
      id={`master_order_${documentType.toLowerCase()}`}
      style={{
        width: '794px', // Standard A4 width at 96 DPI
        minHeight: '1123px', // Standard A4 height
        boxSizing: 'border-box',
        backgroundColor: '#FFFFFF',
        color: primaryColor,
        padding: '40px',
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontSize: '14px',
        lineHeight: '1.5'
      }}
    >
      {/* Header Section */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
        <tbody>
          <tr>
            <td style={{ verticalAlign: 'top', textAlign: 'left', width: '50%' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: primaryColor, letterSpacing: '1px', marginBottom: '4px' }}>VYBE</div>
              <div style={{ color: secondaryColor, fontSize: '12px', textTransform: 'uppercase' }}>Custom Prints & Clothing</div>
            </td>
            <td style={{ verticalAlign: 'top', textAlign: 'right', width: '50%' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: primaryColor, textTransform: 'uppercase', marginBottom: '8px' }}>{documentType}</div>
              <div style={{ color: secondaryColor }}><strong style={{ color: primaryColor }}>Order ID:</strong> {order.id?.toUpperCase() || 'N/A'}</div>
              <div style={{ color: secondaryColor }}><strong style={{ color: primaryColor }}>Date:</strong> {order.date || new Date(order.createdAt).toLocaleDateString()}</div>
              <div style={{ color: secondaryColor }}><strong style={{ color: primaryColor }}>Status:</strong> {order.status || 'N/A'}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Address Section */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
        <tbody>
          <tr>
            <td style={{ verticalAlign: 'top', textAlign: 'left', width: '50%', paddingRight: '20px' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: primaryColor, marginBottom: '8px', borderBottom: `2px solid ${primaryColor}`, paddingBottom: '4px', display: 'inline-block' }}>From</div>
              <div style={{ fontWeight: 'bold', fontSize: '15px', marginTop: '8px', marginBottom: '4px' }}>Vybe Admin</div>
              <div style={{ color: secondaryColor }}>123 Vybe Street, Fashion City</div>
              <div style={{ color: secondaryColor }}>+91 98765 43210</div>
              <div style={{ color: secondaryColor }}>support@vybe.com</div>
            </td>
            <td style={{ verticalAlign: 'top', textAlign: 'left', width: '50%', paddingLeft: '20px' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: primaryColor, marginBottom: '8px', borderBottom: `2px solid ${primaryColor}`, paddingBottom: '4px', display: 'inline-block' }}>To</div>
              <div style={{ fontWeight: 'bold', fontSize: '15px', marginTop: '8px', marginBottom: '4px' }}>{order.customer || order.company || 'Customer Name'}</div>
              <div style={{ color: secondaryColor }}>{order.shippingAddress || 'Address Not Provided'}</div>
              <div style={{ color: secondaryColor }}>{order.phone || 'Phone Not Provided'}</div>
              <div style={{ color: secondaryColor }}>{order.email || 'Email Not Provided'}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
        <thead>
          <tr>
            <th style={{ padding: '12px 8px', textAlign: 'left', backgroundColor: '#f9f9f9', borderBottom: `2px solid ${primaryColor}`, color: primaryColor, width: '40px', fontWeight: 'bold' }}>#</th>
            <th style={{ padding: '12px 8px', textAlign: 'left', backgroundColor: '#f9f9f9', borderBottom: `2px solid ${primaryColor}`, color: primaryColor, fontWeight: 'bold' }}>Item Description</th>
            <th style={{ padding: '12px 8px', textAlign: 'left', backgroundColor: '#f9f9f9', borderBottom: `2px solid ${primaryColor}`, color: primaryColor, width: '100px', fontWeight: 'bold' }}>Price</th>
            <th style={{ padding: '12px 8px', textAlign: 'center', backgroundColor: '#f9f9f9', borderBottom: `2px solid ${primaryColor}`, color: primaryColor, width: '80px', fontWeight: 'bold' }}>Qty</th>
            <th style={{ padding: '12px 8px', textAlign: 'right', backgroundColor: '#f9f9f9', borderBottom: `2px solid ${primaryColor}`, color: primaryColor, width: '120px', fontWeight: 'bold' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            let details = [item.name];
            if (item.selectedSize) details.push(`Size: ${item.selectedSize}`);
            if (item.selectedColor) details.push(`Color: ${item.selectedColor}`);

            return (
              <tr key={item.id || index}>
                <td style={{ padding: '12px 8px', borderBottom: `1px solid ${borderColor}`, color: secondaryColor, verticalAlign: 'top' }}>{index + 1}</td>
                <td style={{ padding: '12px 8px', borderBottom: `1px solid ${borderColor}`, verticalAlign: 'top' }}>
                  <div style={{ fontWeight: 'bold', color: primaryColor }}>{details[0]}</div>
                  {details.length > 1 && <div style={{ fontSize: '12px', color: secondaryColor, marginTop: '4px' }}>{details.slice(1).join(' | ')}</div>}
                </td>
                <td style={{ padding: '12px 8px', borderBottom: `1px solid ${borderColor}`, color: secondaryColor, verticalAlign: 'top' }}>₹{item.price?.toLocaleString() || 0}</td>
                <td style={{ padding: '12px 8px', borderBottom: `1px solid ${borderColor}`, color: secondaryColor, textAlign: 'center', verticalAlign: 'top' }}>{item.qty || 1}</td>
                <td style={{ padding: '12px 8px', borderBottom: `1px solid ${borderColor}`, color: primaryColor, fontWeight: 'bold', textAlign: 'right', verticalAlign: 'top' }}>₹{(item.itemTotal || (item.price * (item.qty || 1)) || 0).toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totals Section */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
        <tbody>
          <tr>
            <td style={{ width: '50%' }}></td>
            <td style={{ width: '50%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px', color: secondaryColor, textAlign: 'left' }}>Sub Total:</td>
                    <td style={{ padding: '8px', color: primaryColor, fontWeight: 'bold', textAlign: 'right' }}>₹{subTotal.toLocaleString()}</td>
                  </tr>
                  {handlingFee > 0 && (
                    <tr>
                      <td style={{ padding: '8px', color: secondaryColor, textAlign: 'left', borderBottom: `1px solid ${borderColor}` }}>Tax / Handling:</td>
                      <td style={{ padding: '8px', color: primaryColor, fontWeight: 'bold', textAlign: 'right', borderBottom: `1px solid ${borderColor}` }}>₹{handlingFee.toLocaleString()}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ padding: '16px 8px', color: primaryColor, fontWeight: 'bold', fontSize: '18px', textAlign: 'left', borderTop: handlingFee === 0 ? `1px solid ${borderColor}` : 'none' }}>Grand Total:</td>
                    <td style={{ padding: '16px 8px', color: primaryColor, fontWeight: 'bold', fontSize: '18px', textAlign: 'right', borderTop: handlingFee === 0 ? `1px solid ${borderColor}` : 'none' }}>₹{total.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Payment Status & Footer */}
      <div style={{ marginTop: 'auto', paddingTop: '40px' }}>

        <div style={{ borderTop: `1px solid ${borderColor}`, margin: '30px 0' }}></div>

        <div style={{ textAlign: 'center', color: secondaryColor, fontSize: '12px', lineHeight: '1.6' }}>
          <strong>Thank you for choosing Vybe!</strong><br />
          Your {documentType.toLowerCase()} has been generated successfully.<br />
          If you have any questions concerning this {documentType.toLowerCase()}, please contact our support team.
        </div>
      </div>
    </div>
  );
}
