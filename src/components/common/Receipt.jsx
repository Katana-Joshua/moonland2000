
import React from 'react';
import { Rocket } from 'lucide-react';
import QRCode from 'qrcode.react';
import { formatCurrency } from '@/lib/utils';
import { usePOS } from '@/contexts/POSContext';

const Receipt = React.forwardRef(({ sale, cart, isDuplicate = false }, ref) => {
  const { receiptSettings } = usePOS();
  
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
    fontSize: '12px', // Increased from 11px
    color: '#000',
    backgroundColor: '#fff',
    padding: '12px 8px',
    fontWeight: '900', // Changed from 'bold' to maximum boldness
    lineHeight: '1.4', // Increased from 1.3
    textAlign: 'center',
    margin: '0 auto',
    textShadow: '0.3px 0.3px 0px #000', // Added text shadow for enhanced boldness
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '8px',
  };

  const sectionStyle = {
    textAlign: 'center',
    margin: '8px 0',
  };

  const line = <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>; // Changed from #333 to #000

  const renderRow = (left, right, isBold = true) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      margin: '3px 0',
      fontWeight: '900', // Changed from 'bold' to maximum boldness
      fontSize: '12px', // Increased from 11px
      textShadow: '0.3px 0.3px 0px #000', // Added text shadow
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
        {receiptSettings.logo ? (
          <img 
            src={receiptSettings.logo} 
            alt="Company Logo" 
            style={{
              margin: '0 auto 6px auto',
              display: 'block',
              width: '32px',
              height: '32px',
              objectFit: 'contain'
            }}
          />
        ) : (
          <Rocket style={{
            margin: '0 auto 6px auto',
            display: 'block',
            width: '32px', // Increased from 28px
            height: '32px', // Increased from 28px
            color: '#2563eb'
          }} />
        )}
        <h2 style={{
          fontSize: '20px', // Increased from 18px
          margin: '0 0 4px 0',
          fontWeight: '900', // Changed from 'bold'
          color: '#000', // Changed from '#1f2937' for higher contrast
          textShadow: '0.5px 0.5px 0px #000', // Added text shadow
        }}>{receiptSettings.companyName || 'MOON LAND POS'}</h2>
        {receiptSettings.address && (
          <p style={{
            fontSize: '11px',
            margin: '0 0 2px 0',
            color: '#000',
            fontWeight: '900'
          }}>{receiptSettings.address}</p>
        )}
        {receiptSettings.phone && (
          <p style={{
            fontSize: '11px',
            margin: '0 0 2px 0',
            color: '#000',
            fontWeight: '900'
          }}>{receiptSettings.phone}</p>
        )}
        <p style={{
          fontSize: '12px', // Increased from 10px
          margin: '0',
          color: '#000', // Changed from '#6b7280' for higher contrast
          fontWeight: '900' // Changed from 'bold'
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
          fontWeight: '900', // Changed from 'bold'
          fontSize: '12px', // Increased from 10px
          color: '#dc2626',
          textAlign: 'center',
          textShadow: '0.3px 0.3px 0px #000', // Added text shadow
        }}>
          --- DUPLICATE RECEIPT ---
        </div>
      )}

      {cleanSale.paymentMethod === 'credit' && cleanSale.customerInfo?.name && (
        <div style={{
          margin: '8px 0',
          padding: '6px',
          border: '1px dashed #000', // Changed from #333
          borderRadius: '4px',
          backgroundColor: '#f9fafb'
        }}>
          <p style={{margin: '0 0 3px 0', fontWeight: '900', fontSize: '12px', color: '#dc2626', textShadow: '0.3px 0.3px 0px #000'}}>CREDIT SALE FOR:</p>
          <p style={{margin: 0, fontWeight: '900', fontSize: '13px', textShadow: '0.3px 0.3px 0px #000'}}>{cleanSale.customerInfo.name}</p>
                      {cleanSale.customerInfo.contact && (
              <p style={{margin: '2px 0 0 0', fontSize: '11px', color: '#000', fontWeight: '900'}}>{cleanSale.customerInfo.contact}</p>
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
          fontWeight: '900', // Changed from 'bold'
          fontSize: '12px', // Increased from 10px
          color: '#000', // Changed from '#374151' for higher contrast
          textAlign: 'center',
          textShadow: '0.3px 0.3px 0px #000', // Added text shadow
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
            fontSize: '12px', // Increased from 10px
            textAlign: 'center',
            alignItems: 'center'
          }}>
            <span style={{ textAlign: 'left', fontWeight: '900', textShadow: '0.3px 0.3px 0px #000' }}>{item.name}</span>
            <span style={{ textAlign: 'center', fontWeight: '900' }}>{item.quantity}</span>
            <span style={{ textAlign: 'right', fontWeight: '900' }}>{formatCurrency(item.price)}</span>
            <span style={{ textAlign: 'right', fontWeight: '900' }}>{formatCurrency(item.price * item.quantity)}</span>
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
          fontWeight: '900', // Changed from 'bold'
          fontSize: '14px', // Increased from 12px
          color: '#000', // Changed from '#1f2937' for higher contrast
          borderTop: '1px solid #000', // Changed from '#333' for higher contrast
          paddingTop: '4px',
          textShadow: '0.5px 0.5px 0px #000', // Added text shadow
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
          fontWeight: '900', // Changed from 'bold'
          fontSize: '13px', // Increased from 11px
          color: '#000', // Changed from '#1f2937' for higher contrast
          textShadow: '0.3px 0.3px 0px #000', // Added text shadow
        }}>
          Payment: {(cleanSale.paymentMethod || 'Unknown').toUpperCase()}
        </p>
        {receiptSettings.footer && (
          <p style={{
            margin: '0 0 8px 0',
            fontSize: '12px',
            color: '#000',
            fontWeight: '900'
          }}>{receiptSettings.footer}</p>
        )}
        <p style={{
          margin: '0 0 8px 0',
          fontSize: '12px', // Increased from 10px
          color: '#000', // Changed from '#6b7280' for higher contrast
          fontWeight: '900' // Changed from 'bold'
        }}>Thank you for your visit!</p>
        
        <div style={{
          marginTop: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <QRCode
            value={`SALE_ID:${cleanSale.id}|RECEIPT:${cleanSale.receiptNumber}`}
            size={60} // Increased from 50
            style={{ margin: 'auto' }}
          />
          <p style={{
            fontSize: '11px', // Increased from 9px
            margin: '4px 0 0 0',
            fontWeight: '900', // Changed from 'bold'
            color: '#000', // Changed from '#6b7280' for higher contrast
            textShadow: '0.3px 0.3px 0px #000', // Added text shadow
          }}>Scan for details</p>
          <p style={{
            fontSize: '11px', // Increased from 9px
            margin: '2px 0 0 0',
            fontWeight: '900', // Changed from 'bold'
            color: '#000', // Changed from '#9ca3af' for higher contrast
          }}>Moon Land POS System</p>
        </div>
      </div>
    </div>
  );
});

export default Receipt;
