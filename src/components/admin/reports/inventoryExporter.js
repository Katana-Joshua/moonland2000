import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportInventoryToPDF = (inventory) => {
  const doc = new jsPDF();
  let yPosition = 20;

  // Header
  doc.setFontSize(20);
  doc.text('Inventory Report', 14, yPosition);
  yPosition += 10;
  doc.setFontSize(12);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, yPosition);
  yPosition += 15;

  // Summary
  const totalItems = inventory.length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.stock), 0);
  const lowStockItems = inventory.filter(item => item.stock <= item.lowStockAlert).length;

  doc.setFontSize(14);
  doc.text('Summary', 14, yPosition);
  yPosition += 8;
  doc.autoTable({
    startY: yPosition,
    theme: 'grid',
    head: [['Metric', 'Value']],
    body: [
      ['Total Items', totalItems.toString()],
      ['Total Inventory Value', `UGX ${totalValue.toLocaleString()}`],
      ['Low Stock Items', lowStockItems.toString()],
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

  // Inventory Details
  if (yPosition > doc.internal.pageSize.height - 40) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.text('Inventory Details', 14, yPosition);
  yPosition += 8;

  const inventoryData = inventory.map(item => [
    item.name || 'N/A',
    item.category || 'N/A',
    item.barcode || 'N/A',
    item.stock?.toString() || '0',
    item.lowStockAlert?.toString() || '0',
    `UGX ${(item.price || 0).toLocaleString()}`,
    `UGX ${(item.costPrice || 0).toLocaleString()}`,
    `UGX ${((item.price || 0) * (item.stock || 0)).toLocaleString()}`
  ]);

  doc.autoTable({
    startY: yPosition,
    theme: 'grid',
    head: [['Name', 'Category', 'Barcode', 'Stock', 'Low Stock Alert', 'Price', 'Cost Price', 'Total Value']],
    body: inventoryData,
    styles: {
      cellPadding: 2,
      fontSize: 8,
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
    },
    columnStyles: {
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right' }
    }
  });

  doc.save(`inventory-report-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportInventoryToExcel = (inventory) => {
  // Create summary data
  const totalItems = inventory.length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.stock), 0);
  const lowStockItems = inventory.filter(item => item.stock <= item.lowStockAlert).length;

  const summaryData = [
    ['Inventory Summary', ''],
    ['Generated:', new Date().toLocaleString()],
    [],
    ['Metric', 'Value'],
    ['Total Items', totalItems],
    ['Total Inventory Value', totalValue],
    ['Low Stock Items', lowStockItems],
  ];

  // Create inventory data
  const inventoryHeader = ['Name', 'Category', 'Barcode', 'Stock', 'Low Stock Alert', 'Price', 'Cost Price', 'Total Value'];
  const inventoryData = inventory.map(item => [
    item.name || 'N/A',
    item.category || 'N/A',
    item.barcode || 'N/A',
    item.stock || 0,
    item.lowStockAlert || 0,
    item.price || 0,
    item.costPrice || 0,
    (item.price || 0) * (item.stock || 0)
  ]);

  // Create worksheets
  const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
  const inventoryWS = XLSX.utils.aoa_to_sheet([inventoryHeader, ...inventoryData]);

  // Set column widths
  summaryWS['!cols'] = [{ wch: 25 }, { wch: 15 }];
  inventoryWS['!cols'] = [
    { wch: 25 }, // Name
    { wch: 15 }, // Category
    { wch: 15 }, // Barcode
    { wch: 8 },  // Stock
    { wch: 12 }, // Low Stock Alert
    { wch: 12 }, // Price
    { wch: 12 }, // Cost Price
    { wch: 12 }  // Total Value
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, summaryWS, 'Summary');
  XLSX.utils.book_append_sheet(wb, inventoryWS, 'Inventory');

  // Save file
  XLSX.writeFile(wb, `inventory-report-${new Date().toISOString().split('T')[0]}.xlsx`);
};
