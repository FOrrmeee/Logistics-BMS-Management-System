import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportInvoicePDF = (data) => {
  const doc = new jsPDF();
  const { invoice, shipment, containers, expense } = data;
  const currency = localStorage.getItem('currency') || '$';

  // Header
  doc.setFontSize(22);
  doc.setTextColor(99, 102, 241);
  doc.text('INVOICE', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Invoice Number: ${invoice?.invoiceNumber || '-'}`, 14, 30);
  doc.text(`Serial Number: ${invoice?.serialNumber || '-'}`, 14, 35);
  doc.text(`Date: ${invoice?.date ? new Date(invoice.date).toLocaleDateString() : '-'}`, 14, 40);
  doc.text(`Importer Name: ${invoice?.importerName || '-'}`, 14, 45);

  // Invoice Details Table
  doc.autoTable({
    startY: 55,
    head: [['Bayan Number', 'Total Income', 'To Transporter']],
    body: [
      [
        invoice?.bayan || '-',
        `${currency} ${invoice?.totalIncome?.toLocaleString() || 0}`,
        `${currency} ${invoice?.toHassan?.toLocaleString() || 0}`
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [99, 102, 241] }
  });

  // Shipment Details
  if (shipment) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Shipment Details', 14, doc.lastAutoTable.finalY + 10);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 14,
      head: [['Manifest #', 'Date', 'Type', 'Bill of Lading', 'Terminal']],
      body: [
        [
          shipment.manifestNumber || '-',
          shipment.manifestDate ? new Date(shipment.manifestDate).toLocaleDateString() : '-',
          shipment.manifestType || '-',
          shipment.billNumber || '-',
          shipment.terminal || '-'
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }
    });
  }

  // Container Details
  if (containers && containers.length > 0) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Container Details', 14, doc.lastAutoTable.finalY + 10);
    const containerBody = containers.map(c => [
      c.containerNumber || '-',
      c.size || '-',
      c.numberOfContainers || '-',
      c.country || '-'
    ]);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 14,
      head: [['Container #', 'Size', 'Count', 'Country']],
      body: containerBody,
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11] }
    });
  }

  // Payments Details
  if (expense) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Payments', 14, doc.lastAutoTable.finalY + 10);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 14,
      head: [['Agent', 'Port', 'Wages', 'Appt', 'Fine', 'Transfer to Agent']],
      body: [
        [
          `${currency} ${expense.agentFees || 0}`,
          `${currency} ${expense.portFees || 0}`,
          `${currency} ${expense.wagesPortsAuthority || 0}`,
          `${currency} ${expense.appointmentFees || 0}`,
          `${currency} ${expense.fines || 0}`,
          `${currency} ${expense.transferToAgent || 0}`
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: [244, 63, 94] }
    });
  }

  // Income Details
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Income Details', 14, doc.lastAutoTable.finalY + 10);
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 14,
    head: [['Customs Clearance', 'Transport', 'To Transporter', 'Total Income']],
    body: [
      [
        `${currency} ${invoice.customsClearanceIncome || 0}`,
        `${currency} ${invoice.transportIncome || 0}`,
        `${currency} ${invoice.toHassan || 0}`,
        `${currency} ${invoice.totalIncome || 0}`
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] }
  });

  // Summary
  const finalY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Summary', 14, finalY);

  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  doc.text(`Total Payments: ${currency} ${(invoice?.totalPayments || 0).toLocaleString()}`, 14, finalY + 10);

  doc.setFont(undefined, 'bold');
  const profitColor = (invoice?.totalProfit || 0) >= 0 ? [16, 185, 129] : [244, 63, 94];
  doc.setTextColor(profitColor[0], profitColor[1], profitColor[2]);
  doc.text(`Total Profit: ${currency} ${(invoice?.totalProfit || 0).toLocaleString()}`, 14, finalY + 20);

  // Download as Blob for maximum browser compatibility
  const filename = `${invoice?.invoiceNumber || 'Invoice'}.pdf`;
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
