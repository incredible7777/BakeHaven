import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoicePDF = (order, user) => {
  // 1. Initialize PDF document (A4 format)
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

  // 3. Invoice Meta
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.text(`Invoice No: INV-${order._id.slice(-6).toUpperCase()}`, 14, 40);
  doc.text(`Order Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}`, 14, 46);
  doc.text(`Payment: ${order.paymentInfo?.method || "Online"} (${order.paymentInfo?.status || "Paid"})`, 14, 52);

  // Customer & Delivery Address Meta
  const addr = order.deliveryAddress || {};
  doc.text(`Billed To: ${addr.fullName || user?.name || "Customer"}`, 120, 40);
  doc.text(`Phone: ${addr.phone || "Not provided"}`, 120, 46);
  doc.text(`Email: ${user?.email || "customer@bakehaven.com"}`, 120, 52);

  let currentY = 58;

  // Print Delivery Destination
  if (addr.address) {
    doc.setFont("helvetica", "bold");
    doc.text("Deliver To Address:", 14, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(`${addr.address}, ${addr.city || ""} - ${addr.pincode || ""}`, 52, currentY);
    currentY += 6;
  }

  // Print Expected Delivery Date / Slot & Cake Plaque Message
  if (addr.deliveryDate || addr.customNote) {
    if (addr.deliveryDate) {
      doc.text(`Delivery Schedule: ${addr.deliveryDate} ${addr.deliveryTimeSlot ? `(${addr.deliveryTimeSlot})` : ""}`, 14, currentY);
      currentY += 6;
    }
    if (addr.customNote) {
      doc.setFont("helvetica", "italic");
      doc.text(`Message on Cake Plaque: "${addr.customNote}"`, 14, currentY);
      currentY += 6;
    }
  }

  // 4. Item Table
  const tableRows = order.items.map((item, index) => [
    index + 1,
    item.name,
    `RS ${item.price}`,
    item.quantity,
    `RS ${item.price * item.quantity}`,
  ]);

  autoTable(doc, {
    startY: currentY + 2,
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
  doc.text("Thank you for ordering with BakeHaven! Baked fresh with love and pure ingredients.", 105, 280, { align: "center" });

  // 7. Save and trigger automatic browser download
  doc.save(`BakeHaven_Invoice_${order._id.slice(-6).toUpperCase()}.pdf`);
};
