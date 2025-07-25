# Receipt Enhancement Plan

## Overview
The current receipt printed from the POS system is not clear on printed paper. This plan outlines changes to make all fonts in the receipt extremely bold to improve readability when printed.

## Implementation Details

### Base Receipt Style Modifications
```javascript
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
```

### Header Elements Enhancement
```javascript
<Rocket style={{ 
  margin: '0 auto 6px auto', 
  display: 'block', 
  width: '32px', // Increased from 28px
  height: '32px', // Increased from 28px
  color: '#2563eb'
}} />
<h2 style={{ 
  fontSize: '20px', // Increased from 18px
  margin: '0 0 4px 0',
  fontWeight: '900', // Changed from 'bold'
  color: '#000', // Changed from '#1f2937' for higher contrast
  textShadow: '0.5px 0.5px 0px #000', // Added text shadow
}}>MOON LAND POS</h2>
<p style={{ 
  fontSize: '12px', // Increased from 10px
  margin: '0',
  color: '#000', // Changed from '#6b7280' for higher contrast
  fontWeight: '900' // Changed from 'bold'
}}>Point of Sale System</p>
```

### Receipt Info Section Enhancement
```javascript
const renderRow = (left, right, isBold = true) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '3px 0',
    fontWeight: '900', // Changed from 'bold'
    fontSize: '12px', // Increased from 11px
    textShadow: '0.3px 0.3px 0px #000', // Added text shadow
  }}>
    <span style={{ textAlign: 'left', flex: '1' }}>{left}</span>
    <span style={{ textAlign: 'right', flex: '1' }}>{right}</span>
  </div>
);
```

### Credit Sale Section Enhancement
```javascript
<p style={{margin: '0 0 3px 0', fontWeight: '900', fontSize: '12px', color: '#000', textShadow: '0.3px 0.3px 0px #000'}}>CREDIT SALE FOR:</p>
<p style={{margin: 0, fontWeight: '900', fontSize: '13px', textShadow: '0.3px 0.3px 0px #000'}}>{cleanSale.customerInfo.name}</p>
{cleanSale.customerInfo.contact && (
  <p style={{margin: '2px 0 0 0', fontSize: '11px', color: '#000', fontWeight: '900'}}>{cleanSale.customerInfo.contact}</p>
)}
```

### Items Section Enhancement
```javascript
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
```

### Totals Section Enhancement
```javascript
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
```

### Payment Details Enhancement
```javascript
{renderRow('Cash Received:', formatCurrency(cleanSale.cashReceived))}
{renderRow('Change Given:', formatCurrency(cleanSale.changeGiven || 0))}
```

### Footer Enhancement
```javascript
<p style={{ 
  margin: '0 0 6px 0', 
  fontWeight: '900', // Changed from 'bold'
  fontSize: '13px', // Increased from 11px
  color: '#000', // Changed from '#1f2937' for higher contrast
  textShadow: '0.3px 0.3px 0px #000', // Added text shadow
}}>
  Payment: {(cleanSale.paymentMethod || 'Unknown').toUpperCase()}
</p>
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
```

## Summary of Changes
1. Increased font-weight to maximum (900) for all text elements
2. Increased font sizes throughout the receipt
3. Added text shadows to enhance boldness
4. Improved contrast by using darker colors
5. Ensured consistent boldness across all elements

## Next Steps
1. Switch to Code mode to implement these changes
2. Test the changes by simulating a print preview
3. Make any necessary adjustments based on the print test results