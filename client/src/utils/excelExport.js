import * as XLSX from 'xlsx';

// Helper to trigger a download from a workbook
const downloadWorkbook = (wb, filename) => {
  // Write workbook to an array buffer
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  // Create a Blob and trigger download
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportInvoicesExcel = (invoices) => {
  const data = invoices.map(inv => ({
    'Invoice Number': inv.invoiceNumber,
    'Serial Number': inv.serialNumber || '',
    'Date': inv.date ? new Date(inv.date).toLocaleDateString() : '',
    'Importer Name': inv.importerName,
    'Bayan Number': inv.bayan,
    'Total Income': inv.totalIncome || 0,
    'Total Payments': inv.totalPayments || 0,
    'Total Profit': inv.totalProfit || 0
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Invoices');

  downloadWorkbook(wb, 'Invoices_Export.xlsx');
};

export const exportSingleInvoiceExcel = (data) => {
  const { invoice, shipment, containers, expense } = data;

  const wb = XLSX.utils.book_new();

  // Invoice Sheet
  const invoiceData = [{
    'Invoice Number': invoice?.invoiceNumber || '',
    'Serial Number': invoice?.serialNumber || '',
    'Date': invoice?.date ? new Date(invoice.date).toLocaleDateString() : '',
    'Importer Name': invoice?.importerName || '',
    'Bayan Number': invoice?.bayan || '',
    'To Transporter': invoice?.toHassan || 0,
    'Total Income': invoice?.totalIncome || 0,
    'Total Payments': invoice?.totalPayments || 0,
    'Total Profit': invoice?.totalProfit || 0
  }];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(invoiceData), 'Invoice Details');

  // Shipment Sheet
  if (shipment) {
    const shipmentData = [{
      'Manifest Number': shipment.manifestNumber || '',
      'Manifest Date': shipment.manifestDate ? new Date(shipment.manifestDate).toLocaleDateString() : '',
      'Manifest Type': shipment.manifestType || '',
      'Bill of Lading': shipment.billNumber || '',
      'Terminal': shipment.terminal || ''
    }];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(shipmentData), 'Shipment');
  }

  // Containers Sheet
  if (containers && containers.length > 0) {
    const containerData = containers.map(c => ({
      'Container Number': c.containerNumber || '',
      'Size': c.size || '',
      'Number of Containers': c.numberOfContainers || 1,
      'Country': c.country || ''
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(containerData), 'Containers');
  }

  // Expenses Sheet
  if (expense) {
    const expenseData = [{
      'Agent Fees': expense.agentFees || 0,
      'Port Fees': expense.portFees || 0,
      'Wages Ports Authority': expense.wagesPortsAuthority || 0,
      'Appointment Fees': expense.appointmentFees || 0,
      'Fine': expense.fines || 0,
      'Transfer to Agent': expense.transferToAgent || 0,
      'Total Payments': expense.totalPayments || 0
    }];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expenseData), 'Expenses');
  }

  // Income Sheet
  const incomeData = [{
    'Customs Clearance': invoice.customsClearanceIncome || 0,
    'Transport': invoice.transportIncome || 0,
    'To Transporter': invoice.toHassan || 0,
    'Total Income': invoice.totalIncome || 0
  }];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(incomeData), 'Income');

  downloadWorkbook(wb, `${invoice?.invoiceNumber || 'Invoice'}.xlsx`);
};
