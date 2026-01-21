'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportProperties {
    dor: any;
    traineeName: string;
    ftoName: string;
}

export default function ExportDORButton({ dor, traineeName, ftoName }: ExportProperties) {

    const generatePDF = () => {
        const doc = new jsPDF();

        // 1. Header
        doc.setFontSize(18);
        doc.text('Daily Observation Report', 14, 20);

        doc.setFontSize(10);
        doc.text(`Trainee: ${traineeName}`, 14, 30);
        doc.text(`FTO: ${ftoName}`, 14, 35);
        doc.text(`Date: ${new Date(dor.date).toLocaleDateString()}`, 150, 30);
        doc.text(`Form ID: #${dor.id}`, 150, 35);

        // 2. Scores Table
        const responseData = JSON.parse(dor.responseData);
        const tableRows: any[] = [];

        dor.template.sections.forEach((section: any) => {
            // Section Header Row
            tableRows.push([section.title, '', '']);

            section.fields.forEach((field: any) => {
                if (field.type === 'RATING') {
                    const score = responseData[field.id] || '-';
                    tableRows.push([
                        { content: field.label, styles: { cellPadding: { left: 5 } } },
                        score,
                        '' // Comments placeholder
                    ]);
                }
            });
        });

        autoTable(doc, {
            startY: 45,
            head: [['Category / Performance Task', 'Rating', 'Notes']],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] },
            columnStyles: {
                0: { cellWidth: 100 },
                1: { cellWidth: 20, halign: 'center' },
                2: { cellWidth: 'auto' }
            },
            didParseCell: (data) => {
                // Bold section headers logic
                const rawRow = data.row.raw as any;
                if (rawRow && rawRow[1] === '' && rawRow[2] === '') {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = [240, 240, 240];
                    data.cell.colSpan = 3;
                }
            }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 10;

        // 3. Narratives
        doc.setFontSize(12);
        doc.text('Narratives', 14, finalY);

        // Extract TEXT fields
        let currentY = finalY + 10;
        dor.template.sections.forEach((section: any) => {
            section.fields.forEach((field: any) => {
                if (field.type === 'TEXT') {
                    const text = responseData[field.id] || 'No comments.';
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    doc.text(field.label, 14, currentY);

                    doc.setFont('helvetica', 'normal');
                    const splitText = doc.splitTextToSize(text, 180);
                    doc.text(splitText, 14, currentY + 5);
                    currentY += (splitText.length * 5) + 10;
                }
            });
        });

        // 4. Signatures
        currentY += 10;

        doc.setDrawColor(200, 200, 200);
        doc.line(14, currentY, 196, currentY);
        currentY += 10;

        doc.setFontSize(10);
        doc.text(`FTO Signature: Signed by ${ftoName}`, 14, currentY);
        doc.text(`Date: ${new Date(dor.date).toLocaleDateString()}`, 14, currentY + 5);

        if (dor.traineeSignatureAt) {
            doc.text(`Trainee Signature: Signed by ${traineeName}`, 110, currentY);
            doc.text(`Date: ${new Date(dor.traineeSignatureAt).toLocaleDateString()}`, 110, currentY + 5);
            doc.text(`(Digitally Signed)`, 110, currentY + 10);
        } else {
            doc.text(`Trainee Signature: PENDING`, 110, currentY);
        }

        doc.save(`DOR_${dor.id}_${new Date(dor.date).toISOString().split('T')[0]}.pdf`);
    };

    return (
        <button
            onClick={generatePDF}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors shadow-sm"
        >
            <Download size={16} />
            <span className="text-sm font-medium">Export PDF</span>
        </button>
    );
}
