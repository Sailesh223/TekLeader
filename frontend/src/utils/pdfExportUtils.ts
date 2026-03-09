import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LeaderboardEntry } from '../api/client';

export const exportLeaderboardToPDF = (
  managers: LeaderboardEntry[],
  month: string,
  functionalHead: string,
  band: string
) => {
  const doc = new jsPDF();
  
  // Add Tekion branding
  doc.setFillColor(0, 191, 165); // Tekion Teal
  doc.rect(0, 0, 210, 35, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('TekLeader Leaderboard', 105, 15, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Performance Report - ${month}`, 105, 25, { align: 'center' });
  
  // Filters info
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  let filterText = 'Filters: ';
  if (functionalHead !== 'all') filterText += `Functional Head: ${functionalHead} | `;
  if (band !== 'all') filterText += `Band: ${band} | `;
  filterText += `Total Managers: ${managers.length}`;
  doc.text(filterText, 105, 32, { align: 'center' });
  
  // Prepare table data
  const tableData = managers.map((entry) => [
    (entry.rank || 0).toString(),
    entry.manager?.displayName || '-',
    entry.manager?.functionalHead || '-',
    entry.classificationBand || '-',
    (entry.finalScore || 0).toFixed(1),
    `${(entry.utilization || 0).toFixed(1)}%`,
    (entry.teamSize || 0).toString(),
    entry.badges?.map(b => b.name).join(', ') || '-',
  ]);
  
  // Add table
  autoTable(doc, {
    startY: 40,
    head: [['Rank', 'Manager', 'Functional Head', 'Band', 'Score', 'Utilization', 'Team Size', 'Badges']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 191, 165],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 3,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 }, // Rank
      1: { halign: 'left', cellWidth: 40 },   // Manager
      2: { halign: 'left', cellWidth: 35 },   // Functional Head
      3: { halign: 'center', cellWidth: 20 }, // Band
      4: { halign: 'center', cellWidth: 20 }, // Score
      5: { halign: 'center', cellWidth: 25 }, // Utilization
      6: { halign: 'center', cellWidth: 20 }, // Team Size
      7: { halign: 'left', cellWidth: 35 },   // Badges
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    didDrawCell: (data) => {
      // Highlight top 3 ranks
      if (data.section === 'body' && data.column.index === 0) {
        const rank = parseInt(data.cell.text[0]);
        if (rank === 1) {
          doc.setFillColor(255, 215, 0, 0.3); // Gold
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
        } else if (rank === 2) {
          doc.setFillColor(192, 192, 192, 0.3); // Silver
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
        } else if (rank === 3) {
          doc.setFillColor(205, 127, 50, 0.3); // Bronze
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
        }
      }
    },
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text(
      'Powered by TekLeader',
      105,
      doc.internal.pageSize.height - 5,
      { align: 'center' }
    );
  }
  
  // Save the PDF
  const filename = `TekLeader_${month.replace('-', '_')}_${functionalHead !== 'all' ? functionalHead.replace(/\s+/g, '_') : 'All'}.pdf`;
  doc.save(filename);
};

