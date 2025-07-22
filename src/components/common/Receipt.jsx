
import React from 'react';
import { Rocket } from 'lucide-react';
import QRCode from 'qrcode.react';
import { formatCurrency } from '@/lib/utils';

const Receipt = React.forwardRef(({ sale, cart, isDuplicate = false }, ref) => {
  if (!sale) return null;

  // Ensure sale data is clean and serializable
  const cleanSale = {
    id: sale.id || '',
    receiptNumber: sale.receiptNumber || '',
    timestamp: sale.timestamp || new Date().toISOString(),
    cashierName: sale.cashierName || '',
    paymentMethod: sale.paymentMethod || '',
    customerInfo: sale.customerInfo || {},
    cashReceived: typeof sale.cashReceived === 'number' ? sale.cashReceived : 0,
    changeGiven: typeof sale.changeGiven === 'number' ? sale.changeGiven : 0,
  };

  // Always use sale.items for the receipt
  const items = (sale.items || []).map(item => ({
    id: item.id || '',
    name: item.name || '',
    price: typeof item.price === 'number' ? item.price : Number(item.price) || 0,
    quantity: typeof item.quantity === 'number' ? item.quantity : Number(item.quantity) || 0,
  }));

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = 0; // Example tax rate, can be made dynamic
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const receiptStyle = {
    width: '80mm',
    maxWidth: '80mm',
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: '11px',
    color: '#000',
    backgroundColor: '#fff',
    padding: '12px 8px',
    fontWeight: 'bold',
    lineHeight: '1.3',
    textAlign: 'center',
    margin: '0 auto',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '8px',
  };

  const sectionStyle = {
    textAlign: 'center',
    margin: '8px 0',
  };

  const line = <div style={{ borderTop: '1px dashed #333', margin: '8px 0' }}></div>;

  const renderRow = (left, right, isBold = true) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      margin: '3px 0',
      fontWeight: isBold ? 'bold' : 'bold',
      fontSize: '11px',
    }}>
      <span style={{ textAlign: 'left', flex: '1' }}>{left}</span>
      <span style={{ textAlign: 'right', flex: '1' }}>{right}</span>
    </div>
  );

  const formatDate = (timestamp) => {
    const date = new Date(timestamp || Date.now());
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Africa/Kampala'
    });
  };

  return (
    <div ref={ref} style={receiptStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <Rocket style={{ 
          margin: '0 auto 6px auto', 
          display: 'block', 
          width: '28px', 
          height: '28px',
          color: '#2563eb'
        }} />
        <h2 style={{ 
          fontSize: '18px', 
          margin: '0 0 4px 0',
          fontWeight: 'bold',
          color: '#1f2937'
        }}>MOON LAND POS</h2>
        <p style={{ 
          fontSize: '10px', 
          margin: '0',
          color: '#6b7280',
          fontWeight: 'bold'
        }}>Point of Sale System</p>
      </div>

      {line}

      {/* Receipt Info */}
      <div style={sectionStyle}>
        {renderRow('Receipt #:', cleanSale.receiptNumber || 'N/A')}
        {renderRow('Date:', formatDate(cleanSale.timestamp))}
        {renderRow('Cashier:', cleanSale.cashierName || 'N/A')}
        {renderRow('Time:', new Date(cleanSale.timestamp || Date.now()).toLocaleTimeString('en-US', { timeZone: 'Africa/Kampala' }))}
      </div>

      {isDuplicate && (
        <div style={{ 
          margin: '8px 0', 
          fontWeight: 'bold', 
          fontSize: '10px',
          color: '#dc2626',
          textAlign: 'center'
        }}>
          --- DUPLICATE RECEIPT ---
        </div>
      )}

      {cleanSale.paymentMethod === 'credit' && cleanSale.customerInfo?.name && (
        <div style={{ 
          margin: '8px 0', 
          padding: '6px', 
          border: '1px dashed #333',
          borderRadius: '4px',
          backgroundColor: '#f9fafb'
        }}>
          <p style={{margin: '0 0 3px 0', fontWeight: 'bold', fontSize: '10px', color: '#dc2626'}}>CREDIT SALE FOR:</p>
          <p style={{margin: 0, fontWeight: 'bold', fontSize: '11px'}}>{cleanSale.customerInfo.name}</p>
                      {cleanSale.customerInfo.contact && (
              <p style={{margin: '2px 0 0 0', fontSize: '9px', color: '#6b7280', fontWeight: 'bold'}}>{cleanSale.customerInfo.contact}</p>
            )}
        </div>
      )}

      {line}

      {/* Items Header */}
      <div style={sectionStyle}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1.5fr 1.5fr',
          gap: '4px',
          marginBottom: '6px',
          fontWeight: 'bold',
          fontSize: '10px',
          color: '#374151',
          textAlign: 'center'
        }}>
          <span>ITEM</span>
          <span>QTY</span>
          <span>UNIT</span>
          <span>TOTAL</span>
        </div>

        {/* Items */}
        {items.map((item, index) => (
          <div key={item.id || item.name || index} style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1.5fr 1.5fr',
            gap: '4px',
            margin: '4px 0',
            fontSize: '10px',
            textAlign: 'center',
            alignItems: 'center'
          }}>
            <span style={{ textAlign: 'left', fontWeight: 'bold' }}>{item.name}</span>
            <span style={{ textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</span>
            <span style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(item.price)}</span>
            <span style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      {line}

      {/* Totals */}
      <div style={sectionStyle}>
        {renderRow('Subtotal:', formatCurrency(subtotal))}
        {renderRow('Tax:', formatCurrency(taxAmount))}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: '6px 0',
          fontWeight: 'bold',
          fontSize: '12px',
          color: '#1f2937',
          borderTop: '1px solid #333',
          paddingTop: '4px'
        }}>
          <span>TOTAL:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Payment Details */}
      {cleanSale.paymentMethod === 'cash' && cleanSale.cashReceived && cleanSale.cashReceived > 0 && (
        <>
          {line}
          <div style={sectionStyle}>
            {renderRow('Cash Received:', formatCurrency(cleanSale.cashReceived))}
            {renderRow('Change Given:', formatCurrency(cleanSale.changeGiven || 0))}
          </div>
        </>
      )}

      {line}

      {/* Footer */}
      <div style={{ marginTop: '8px', textAlign: 'center' }}>
        <p style={{ 
          margin: '0 0 6px 0', 
          fontWeight: 'bold', 
          fontSize: '11px',
          color: '#1f2937'
        }}>
          Payment: {(cleanSale.paymentMethod || 'Unknown').toUpperCase()}
        </p>
        <p style={{ 
          margin: '0 0 8px 0', 
          fontSize: '10px',
          color: '#6b7280',
          fontWeight: 'bold'
        }}>Thank you for your visit!</p>
        
        <div style={{ 
          marginTop: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <QRCode 
            value={`SALE_ID:${cleanSale.id}|RECEIPT:${cleanSale.receiptNumber}`} 
            size={50} 
            style={{ margin: 'auto' }} 
          />
          <p style={{ 
            fontSize: '9px', 
            margin: '4px 0 0 0', 
            fontWeight: 'bold',
            color: '#6b7280'
          }}>Scan for details</p>
          <p style={{ 
            fontSize: '9px', 
            margin: '2px 0 0 0', 
            fontWeight: 'bold',
            color: '#9ca3af'
          }}>Moon Land POS System</p>
        </div>
      </div>
    </div>
  );
});

export default Receipt;
