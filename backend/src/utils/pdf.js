import PDFDocument from 'pdfkit';

export function generateBillPdf({ bill, patient }) {
  const doc = new PDFDocument({ margin: 50 });

  doc.fontSize(18).text('Hospital Invoice', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Patient: ${patient.firstName} ${patient.lastName}`);
  doc.text(`Bill ID: ${bill.id}`);
  doc.text(`Date: ${new Date(bill.createdAt).toLocaleString()}`);
  doc.moveDown();

  doc.text('Items:');
  doc.moveDown(0.5);
  doc.fontSize(11);
  bill.items.forEach((item) => {
    doc.text(`${item.label}  x${item.quantity}  @ ${Number(item.unitPrice).toFixed(2)}  = ${Number(item.lineTotal).toFixed(2)}`);
  });
  doc.moveDown();
  doc.fontSize(12).text(`Total: ${Number(bill.total).toFixed(2)}`, { align: 'right' });

  doc.end();
  return doc;
}


