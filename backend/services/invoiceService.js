const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate SmartLease Payment Invoice PDF
 *
 * @param {Object} data
 * @returns {Promise<Object>}
 */
const generateInvoice = async (data) => {
    const {
        invoiceNumber,
        transactionId,
        invoiceDate,
        tenantName,
        tenantEmail,
        propertyTitle,
        propertyAddress,
        monthlyRent,
        securityDeposit,
        totalAmount,
        paymentMethod,
        currency = 'INR'
    } = data;

    return new Promise((resolve, reject) => {
        try {
            const invoiceDirectory = path.join(__dirname, '../uploads/invoices');

            if (!fs.existsSync(invoiceDirectory)) {
                fs.mkdirSync(invoiceDirectory, { recursive: true });
            }

            const fileName = `${invoiceNumber}.pdf`;
            const filePath = path.join(invoiceDirectory, fileName);

            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            // =====================================================
            // COLORS & FONTS
            // =====================================================
            const colorPrimary = '#1E3A8A'; // Deep Blue
            const colorSecondary = '#64748B'; // Slate
            const colorText = '#334155'; // Dark Slate
            const colorLight = '#F1F5F9'; // Light Slate

            // =====================================================
            // HEADER BAR
            // =====================================================
            doc.rect(0, 0, 595, 120).fill(colorPrimary);
            
            doc.fillColor('#FFFFFF')
               .fontSize(28)
               .font('Helvetica-Bold')
               .text('SMARTLEASE', 50, 45);
               
            doc.fontSize(10)
               .font('Helvetica')
               .text('AI Rental Agreement Intelligence Platform', 50, 75);
               
            doc.fontSize(24)
               .font('Helvetica-Bold')
               .text('INVOICE', 400, 45, { align: 'right' });

            // Reset fill color for text
            doc.fillColor(colorText);

            // =====================================================
            // INVOICE META DATA
            // =====================================================
            doc.moveDown(4); // Move past the header
            
            const metaTop = 150;
            doc.fontSize(10)
               .font('Helvetica-Bold')
               .fillColor(colorSecondary)
               .text('Invoice Number:', 350, metaTop)
               .font('Helvetica')
               .fillColor(colorText)
               .text(invoiceNumber, 440, metaTop);

            doc.font('Helvetica-Bold')
               .fillColor(colorSecondary)
               .text('Date:', 350, metaTop + 15)
               .font('Helvetica')
               .fillColor(colorText)
               .text(new Date(invoiceDate).toLocaleDateString(), 440, metaTop + 15);

            doc.font('Helvetica-Bold')
               .fillColor(colorSecondary)
               .text('Transaction ID:', 350, metaTop + 30)
               .font('Helvetica')
               .fillColor(colorText)
               .text(transactionId, 440, metaTop + 30);

            // =====================================================
            // BILL TO & PROPERTY INFO
            // =====================================================
            const detailsTop = 150;
            
            // Bill To
            doc.fontSize(12)
               .font('Helvetica-Bold')
               .fillColor(colorPrimary)
               .text('BILLED TO:', 50, detailsTop);
               
            doc.fontSize(10)
               .font('Helvetica-Bold')
               .fillColor(colorText)
               .text(tenantName, 50, detailsTop + 20)
               .font('Helvetica')
               .text(tenantEmail, 50, detailsTop + 35);

            // Property Details
            doc.fontSize(12)
               .font('Helvetica-Bold')
               .fillColor(colorPrimary)
               .text('PROPERTY DETAILS:', 50, detailsTop + 70);
               
            doc.fontSize(10)
               .font('Helvetica-Bold')
               .fillColor(colorText)
               .text(propertyTitle, 50, detailsTop + 90)
               .font('Helvetica')
               .text(propertyAddress || 'N/A', 50, detailsTop + 105, { width: 250 });

            // =====================================================
            // TABLE HEADER
            // =====================================================
            const tableTop = 320;
            
            doc.rect(50, tableTop, 495, 25).fill(colorLight);
            
            doc.fillColor(colorPrimary)
               .font('Helvetica-Bold')
               .fontSize(10)
               .text('DESCRIPTION', 60, tableTop + 7)
               .text('AMOUNT', 420, tableTop + 7, { width: 110, align: 'right' });

            // =====================================================
            // TABLE ROWS
            // =====================================================
            const row1Y = tableTop + 35;
            doc.fillColor(colorText)
               .font('Helvetica')
               .text('First Month Rent', 60, row1Y)
               .text(`${currency} ${Number(monthlyRent).toLocaleString('en-IN')}`, 420, row1Y, { width: 110, align: 'right' });
               
            // Draw a subtle line
            doc.moveTo(50, row1Y + 20).lineTo(545, row1Y + 20).strokeColor('#E2E8F0').lineWidth(1).stroke();

            const row2Y = row1Y + 30;
            doc.text('Security Deposit', 60, row2Y)
               .text(`${currency} ${Number(securityDeposit).toLocaleString('en-IN')}`, 420, row2Y, { width: 110, align: 'right' });
               
            doc.moveTo(50, row2Y + 20).lineTo(545, row2Y + 20).strokeColor('#E2E8F0').lineWidth(1).stroke();

            // =====================================================
            // TOTALS
            // =====================================================
            const totalY = row2Y + 40;
            
            doc.rect(320, totalY, 225, 30).fill(colorPrimary);
            
            doc.fillColor('#FFFFFF')
               .font('Helvetica-Bold')
               .fontSize(12)
               .text('TOTAL PAID:', 330, totalY + 8)
               .text(`${currency} ${Number(totalAmount).toLocaleString('en-IN')}`, 420, totalY + 8, { width: 115, align: 'right' });

            // =====================================================
            // PAYMENT STATUS
            // =====================================================
            doc.fillColor(colorText)
               .fontSize(10)
               .font('Helvetica-Bold')
               .text('Payment Status:', 50, totalY)
               .fillColor('#10B981') // Emerald Green
               .text('SUCCESS (PAID)', 140, totalY);
               
            doc.fillColor(colorSecondary)
               .font('Helvetica')
               .text(`Payment Method: ${paymentMethod}`, 50, totalY + 15);

            // =====================================================
            // DEMO NOTICE & FOOTER
            // =====================================================
            const footerTop = 700;
            
            doc.moveTo(50, footerTop).lineTo(545, footerTop).strokeColor(colorPrimary).lineWidth(2).stroke();
            
            doc.fillColor(colorSecondary)
               .fontSize(8)
               .font('Helvetica-Oblique')
               .text('Note: This invoice was generated for the SmartLease college project demo. The payment system uses a mock payment gateway and does not represent a real financial transaction.', 50, footerTop + 15, { align: 'center' });

            doc.fillColor(colorPrimary)
               .fontSize(10)
               .font('Helvetica-Bold')
               .text('Thank you for choosing SmartLease!', 50, footerTop + 45, { align: 'center' });

            // =====================================================
            // FINISH PDF
            // =====================================================
            doc.end();

            writeStream.on('finish', () => resolve({ invoiceNumber, fileName, filePath }));
            writeStream.on('error', (error) => reject(error));
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    generateInvoice
};