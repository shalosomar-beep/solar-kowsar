import jsPDF from "jspdf";

/**
 * Generates a clean PDF financial + energy usage report.
 * @param {Object} params - Report data
 */
export function generateFinancialPDF({
  selectedMonth,
  totalCollected,
  totalPending,
  totalOverdue,
  totalOutstanding,
  totalBilled,
  totalKwh,
  collectionRate,
  activeCustomerCount,
  avgKwhPerCustomer,
  avgRevenuePerCustomer,
  customerBreakdown,
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = 20;

  // Header
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 0, pageWidth, 25, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Somali Solar Company", margin, 12);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Warbixin Maaliyadeed iyo Isticmaalka Korontada", margin, 18);
  doc.text(`Bisha: ${selectedMonth}`, pageWidth - margin, 18, { align: "right" });

  y = 35;
  doc.setTextColor(30, 30, 30);

  // Summary section
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Kooban", margin, y);
  y += 7;

  const summaryItems = [
    { label: "Dakhiga La Ururiyay", value: `$${totalCollected.toLocaleString()}`, color: [16, 185, 129] },
    { label: "Sugaya La Bixin", value: `$${totalPending.toLocaleString()}`, color: [245, 158, 11] },
    { label: "Dhaafay", value: `$${totalOverdue.toLocaleString()}`, color: [239, 68, 68] },
    { label: "Xisaabaha Sugan", value: `$${totalOutstanding.toLocaleString()}`, color: [59, 130, 246] },
    { label: "Wadarta Bill-ka", value: `$${totalBilled.toLocaleString()}`, color: [30, 30, 30] },
    { label: "Isticmaalka KWh", value: `${totalKwh.toFixed(1)} KWh`, color: [6, 182, 212] },
    { label: "Macaamiil Bishan", value: `${activeCustomerCount}`, color: [59, 130, 246] },
    { label: "Celcelis KWh/Macmiil", value: `${avgKwhPerCustomer} KWh`, color: [6, 182, 212] },
    { label: "Celcelis Dakhiga/Macmiil", value: `$${avgRevenuePerCustomer}`, color: [16, 185, 129] },
    { label: "Darajada Ururinta", value: `${collectionRate}%`, color: [16, 185, 129] },
  ];

  doc.setFontSize(10);
  summaryItems.forEach((item) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(item.label, margin, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...item.color);
    doc.text(item.value, pageWidth - margin, y, { align: "right" });
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);
    y += 8;
  });

  // Customer breakdown table
  y += 5;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Faahfaasha Macaamiisha", margin, y);
  y += 7;

  // Table header
  const colX = {
    name: margin,
    bills: margin + 70,
    kwh: margin + 90,
    paid: margin + 115,
    pending: margin + 140,
    overdue: margin + 165,
    total: pageWidth - margin,
  };

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 100, 100);
  doc.text("Macmiilka", colX.name, y);
  doc.text("Bills", colX.bills, y);
  doc.text("KWh", colX.kwh, y, { align: "right" });
  doc.text("Bixiyay", colX.paid, y, { align: "right" });
  doc.text("Sugaya", colX.pending, y, { align: "right" });
  doc.text("Dhaafay", colX.overdue, y, { align: "right" });
  doc.text("Guud", colX.total, y, { align: "right" });
  y += 3;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Table rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const rowsToShow = customerBreakdown.slice(0, 22);
  rowsToShow.forEach((c) => {
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
    doc.setTextColor(40, 40, 40);
    const name = c.name.length > 25 ? c.name.slice(0, 25) + "…" : c.name;
    doc.text(name, colX.name, y);
    doc.text(String(c.bills), colX.bills, y);
    doc.text(c.kwh.toFixed(1), colX.kwh, y, { align: "right" });
    doc.setTextColor(16, 185, 129);
    doc.text(`$${c.paid.toLocaleString()}`, colX.paid, y, { align: "right" });
    doc.setTextColor(245, 158, 11);
    doc.text(`$${c.pending.toLocaleString()}`, colX.pending, y, { align: "right" });
    doc.setTextColor(239, 68, 68);
    doc.text(`$${c.overdue.toLocaleString()}`, colX.overdue, y, { align: "right" });
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "bold");
    doc.text(`$${c.total.toLocaleString()}`, colX.total, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    y += 6;
  });

  if (customerBreakdown.length > 22) {
    y += 2;
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text(`... iyo ${customerBreakdown.length - 22} macmiil kale (eeg warbinta buuxda)`, margin, y);
  }

  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Somali Solar Company | Warbixin Maaliyadeed ${selectedMonth} | Boggan ${i}/${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  doc.save(`warbixin-maaliyadeed-${selectedMonth}.pdf`);
}