import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoicePDF = (order, user) => {
  // 1. Initialize PDF document
  const doc = new jsPDF({ format: "a4", unit: "mm" });

  // 2. Top Header Bar (BakeHaven Brown #573818)
  doc.setFillColor(87, 56, 24);
  doc.rect(0, 0, 210, 32, "F");

  // Header Brand Text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("BakeHaven", 14, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Artisan Cakes & Bakery Treats", 14, 25);
  doc.text("TAX INVOICE / RECEIPT", 196, 20, { align: "right" });

  // 3. Invoice & Customer Details
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.text(`Invoice No: INV-${order._id.slice(-6).toUpperCase()}`, 14, 42);
  doc.text(`Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}`, 14, 48);
  doc.text(`Payment Status: ${order.paymentInfo?.status || "Paid"}`, 14, 54);

  doc.text(`Customer: ${user?.name || "Customer"}`, 130, 42);
  doc.text(`Email: ${user?.email || "customer@bakehaven.com"}`, 130, 48);

  // 4. Item Table
  const tableRows = order.items.map((item, index) => [
    index + 1,
    item.name,
    `RS ${item.price}`,
    item.quantity,
    `RS ${item.price * item.quantity}`,
  ]);

  autoTable(doc, {
    startY: 62,
    head: [["#", "Cake Description", "Price", "Qty", "Total"]],
    body: tableRows,
    headStyles: { fillColor: [87, 56, 24], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [255, 251, 233] },
  });

  // 5. Total
  const finalY = doc.lastAutoTable.finalY + 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(87, 56, 24);
  doc.text(`Total Amount: RS ${order.totalAmount}`, 196, finalY, { align: "right" });

  // 6. Footer Note
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(120, 120, 120);
  doc.text("Thank you for ordering with BakeHaven! Baked fresh with pure ingredients.", 105, 280, { align: "center" });

  // 7. Save and trigger automatic browser download
  doc.save(`BakeHaven_Invoice_${order._id.slice(-6).toUpperCase()}.pdf`);
};