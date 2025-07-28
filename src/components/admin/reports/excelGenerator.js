import * as XLSX from 'xlsx';

export const generateExcel = ({ sales, expenses, departmentBreakdown }) => {
  const paidSales = sales.filter(s => s.status === 'paid');
  const unpaidSales = sales.filter(s => s.status === 'unpaid');

  const totalRevenue = paidSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalProfit = paidSales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const outstandingCredit = unpaidSales.reduce((sum, sale) => sum + sale.total, 0);
  const netProfit = totalProfit - totalExpenses;

  // --- Create Summary Worksheet ---
  const summaryData = [
    ['Financial Summary', ''],
    ['Generated:', new Date().toLocaleString()],
    [],
    ['Metric', 'Amount (UGX)'],
    ['Total Revenue (Paid)', totalRevenue],
    ['Outstanding Credit', outstandingCredit],
    ['Total Cost of Goods (for Paid Sales)', totalRevenue - totalProfit],
    ['Gross Profit (on Paid Sales)', totalProfit],
    ['Total Expenses', totalExpenses],
    ['Net Profit', netProfit],
  ];
  const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
  summaryWS['!cols'] = [{ wch: 35 }, { wch: 20 }];

  // --- Create Department Breakdown Worksheet ---
  const breakdownHeader = ['Department', 'Revenue (UGX)', 'Profit (UGX)', 'Items Sold'];
  const breakdownBody = departmentBreakdown.map(([category, data]) => [
    category,
    data.sales,
    data.profit,
    data.itemsSold
  ]);
  const breakdownWS = XLSX.utils.aoa_to_sheet([breakdownHeader, ...breakdownBody]);
  breakdownWS['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];


  // --- Create Sales Worksheet ---
  const salesHeader = ['Date', 'Receipt #', 'Items', 'Total', 'Profit', 'Payment Method', 'Status', 'Customer', 'Cashier'];
  const salesBody = sales.map(sale => [
    new Date(sale.timestamp).toLocaleString(),
    sale.receiptNumber,
    sale.items.map(i => `${i.name} x${i.quantity}`).join(', '),
    sale.total,
    sale.profit || 0,
    sale.paymentMethod,
    sale.status,
    sale.customerInfo?.name || 'N/A',
    sale.cashierName,
  ]);
  const salesWS = XLSX.utils.aoa_to_sheet([salesHeader, ...salesBody]);
  salesWS['!cols'] = [{ wch: 22 }, { wch: 15 }, { wch: 40 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 10 }, { wch: 20 }, { wch: 15 }];

  // --- Create Expenses Worksheet ---
  const expensesHeader = ['Date', 'Description', 'Amount', 'Recorded By'];
  const expensesBody = expenses.map(e => [
    new Date(e.timestamp).toLocaleString(),
    e.description,
    e.amount,
    e.cashier,
  ]);
  const expensesWS = XLSX.utils.aoa_to_sheet([expensesHeader, ...expensesBody]);
  expensesWS['!cols'] = [{ wch: 22 }, { wch: 40 }, { wch: 15 }, { wch: 15 }];

  // --- Create Workbook and Download ---
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, summaryWS, 'Summary');
  XLSX.utils.book_append_sheet(wb, breakdownWS, 'Department Sales');
  XLSX.utils.book_append_sheet(wb, salesWS, 'Sales Details');
  XLSX.utils.book_append_sheet(wb, expensesWS, 'Expenses Details');

  XLSX.writeFile(wb, `financial-report-${new Date().toISOString().split('T')[0]}.xlsx`);
}; 