import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePDF = (sales, expenses) => {
  // Add safety checks for input parameters
  const safeSales = sales || [];
  const safeExpenses = expenses || [];
  
  const doc = new jsPDF();
  let yPosition = 20;

  const paidSales = safeSales.filter(s => s.status === 'paid');
  const unpaidSales = safeSales.filter(s => s.status === 'unpaid');

  const totalRevenue = paidSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const totalProfit = paidSales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
  const totalExpenses = safeExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const outstandingCredit = unpaidSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const netProfit = totalProfit - totalExpenses;

  // Header
  doc.setFontSize(20);
  doc.text('Moon Land Financial Report', 14, yPosition);
  yPosition += 10;
  doc.setFontSize(12);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, yPosition);
  yPosition += 15;

  // Summary Table
  doc.setFontSize(14);
  doc.text('Financial Summary', 14, yPosition);
  yPosition += 8;
  doc.autoTable({
    startY: yPosition,
    theme: 'grid',
    head: [['Metric', 'Amount (UGX)']],
    body: [
      ['Total Revenue (Paid)', totalRevenue.toLocaleString()],
      ['Outstanding Credit', outstandingCredit.toLocaleString()],
      ['Total Cost of Goods (for Paid Sales)', (totalRevenue - totalProfit).toLocaleString()],
      ['Gross Profit (on Paid Sales)', totalProfit.toLocaleString()],
      ['Total Expenses', `(${totalExpenses.toLocaleString()})`],
      ['Net Profit', netProfit.toLocaleString()],
    ],
    styles: {
      cellPadding: 2,
      fontSize: 10,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255
    },
    bodyStyles: {
      fillColor: [245, 245, 245]
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255]
    }
  });
  yPosition = doc.autoTable.previous.finalY + 15;

  // Sales Details with Particulars
  if (safeSales.length > 0) {
    if (yPosition > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setFontSize(14);
    doc.text('All Sales Details', 14, yPosition);
    yPosition += 8;
    
    const salesBody = safeSales.flatMap(sale => {
      const statusStyle = sale.status === 'unpaid' ? { textColor: [231, 76, 60] } : { textColor: [39, 174, 96] };
      const mainRow = [
        { content: new Date(sale.timestamp || Date.now()).toLocaleString('en-US', { timeZone: 'Africa/Kampala' }), styles: { fontStyle: 'bold' } },
        { content: sale.receiptNumber || 'N/A', styles: { fontStyle: 'bold' } },
        { content: `UGX ${(sale.total || 0).toLocaleString()}`, styles: { fontStyle: 'bold' } },
        { content: (sale.status || 'unknown').toUpperCase(), styles: { fontStyle: 'bold', ...statusStyle } }
      ];
      
      const itemRows = (sale.items || []).map(item => ([
        { 
          content: `  - ${item.name || 'Unknown Item'} x${item.quantity || 0}`, 
          colSpan: 2, 
          styles: { textColor: [100, 100, 100], cellPadding: {left: 4} } 
        },
        { 
          content: `UGX ${((item.price || 0) * (item.quantity || 0)).toLocaleString()}`,
          colSpan: 2,
          styles: { halign: 'right', textColor: [100, 100, 100], cellPadding: {right: 4} } 
        }
      ]));
      
      return [mainRow, ...itemRows];
    });

    doc.autoTable({
      startY: yPosition,
      theme: 'grid',
      head: [['Date', 'Receipt #', 'Total', 'Status']],
      body: salesBody,
    });
    yPosition = doc.autoTable.previous.finalY + 15;
  }
  
  // Expenses Details
  if (safeExpenses.length > 0) {
    if (yPosition > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setFontSize(14);
    doc.text('Expenses Details', 14, yPosition);
    yPosition += 8;
    doc.autoTable({
      startY: yPosition,
      theme: 'grid',
      head: [['Date', 'Description', 'Amount', 'Recorded By']],
      body: safeExpenses.map(e => [
        new Date(e.timestamp || Date.now()).toLocaleString(),
        e.description || 'N/A',
        `UGX ${(e.amount || 0).toLocaleString()}`,
        e.cashier || 'Unknown'
      ]),
    });
  }

  doc.save(`financial-report-${new Date().toISOString().split('T')[0]}.pdf`);
};