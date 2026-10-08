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
            // =====================================================
            // INVOICE DIRECTORY
            // =====================================================

            const invoiceDirectory =
                path.join(
                    __dirname,
                    '../uploads/invoices'
                );

            if (!fs.existsSync(invoiceDirectory)) {
                fs.mkdirSync(
                    invoiceDirectory,
                    {
                        recursive: true
                    }
                );
            }

            // =====================================================
            // FILE PATH
            // =====================================================

            const fileName =
                `${invoiceNumber}.pdf`;

            const filePath =
                path.join(
                    invoiceDirectory,
                    fileName
                );

            // =====================================================
            // CREATE PDF
            // =====================================================

            const doc =
                new PDFDocument({
                    size: 'A4',
                    margin: 50
                });

            const writeStream =
                fs.createWriteStream(
                    filePath
                );

            doc.pipe(writeStream);

            // =====================================================
            // HEADER
            // =====================================================

            doc
                .fontSize(24)
                .font('Helvetica-Bold')
                .text(
                    'SMARTLEASE',
                    {
                        align: 'center'
                    }
                );

            doc
                .moveDown(0.3)
                .fontSize(11)
                .font('Helvetica')
                .text(
                    'AI Rental Agreement Intelligence Platform',
                    {
                        align: 'center'
                    }
                );

            doc
                .moveDown(1);

            // =====================================================
            // TITLE
            // =====================================================

            doc
                .fontSize(20)
                .font('Helvetica-Bold')
                .text(
                    'PAYMENT INVOICE',
                    {
                        align: 'center'
                    }
                );

            doc
                .moveDown(1);

            // =====================================================
            // INVOICE INFORMATION
            // =====================================================

            doc
                .fontSize(10)
                .font('Helvetica-Bold')
                .text(
                    `Invoice Number: ${invoiceNumber}`
                );

            doc
                .font('Helvetica')
                .text(
                    `Transaction ID: ${transactionId}`
                );

            doc
                .text(
                    `Invoice Date: ${invoiceDate}`
                );

            doc
                .moveDown(1);

            // =====================================================
            // TENANT DETAILS
            // =====================================================

            doc
                .fontSize(13)
                .font('Helvetica-Bold')
                .text(
                    'Tenant Details'
                );

            doc
                .moveDown(0.3)
                .fontSize(10)
                .font('Helvetica')
                .text(
                    `Name: ${tenantName}`
                )
                .text(
                    `Email: ${tenantEmail}`
                );

            doc
                .moveDown(1);

            // =====================================================
            // PROPERTY DETAILS
            // =====================================================

            doc
                .fontSize(13)
                .font('Helvetica-Bold')
                .text(
                    'Property Details'
                );

            doc
                .moveDown(0.3)
                .fontSize(10)
                .font('Helvetica')
                .text(
                    `Property: ${propertyTitle}`
                )
                .text(
                    `Address: ${propertyAddress || 'N/A'}`
                );

            doc
                .moveDown(1);

            // =====================================================
            // PAYMENT DETAILS
            // =====================================================

            doc
                .fontSize(13)
                .font('Helvetica-Bold')
                .text(
                    'Payment Details'
                );

            doc
                .moveDown(0.5);

            // Table header
            const tableTop =
                doc.y;

            doc
                .fontSize(10)
                .font('Helvetica-Bold')
                .text(
                    'Description',
                    60,
                    tableTop
                );

            doc
                .text(
                    'Amount',
                    420,
                    tableTop
                );

            doc
                .moveTo(
                    60,
                    tableTop + 18
                )
                .lineTo(
                    535,
                    tableTop + 18
                )
                .stroke();

            // Monthly rent
            const rentY =
                tableTop + 30;

            doc
                .font('Helvetica')
                .text(
                    'First Month Rent',
                    60,
                    rentY
                );

            doc
                .text(
                    `${currency} ${Number(
                        monthlyRent
                    ).toLocaleString('en-IN')}`,
                    420,
                    rentY
                );

            // Security deposit
            const depositY =
                rentY + 25;

            doc
                .text(
                    'Security Deposit',
                    60,
                    depositY
                );

            doc
                .text(
                    `${currency} ${Number(
                        securityDeposit
                    ).toLocaleString('en-IN')}`,
                    420,
                    depositY
                );

            // Total line
            const totalY =
                depositY + 30;

            doc
                .moveTo(
                    60,
                    totalY - 8
                )
                .lineTo(
                    535,
                    totalY - 8
                )
                .stroke();

            doc
                .font('Helvetica-Bold')
                .text(
                    'Total Paid',
                    60,
                    totalY
                );

            doc
                .text(
                    `${currency} ${Number(
                        totalAmount
                    ).toLocaleString('en-IN')}`,
                    420,
                    totalY
                );

            // =====================================================
            // PAYMENT STATUS
            // =====================================================

            doc
                .moveDown(3);

            doc
                .fontSize(12)
                .font('Helvetica-Bold')
                .text(
                    'Payment Status: PAID'
                );

            doc
                .fontSize(10)
                .font('Helvetica')
                .text(
                    `Payment Method: ${paymentMethod}`
                );

            // =====================================================
            // DEMO NOTICE
            // =====================================================

            doc
                .moveDown(1);

            doc
                .fontSize(9)
                .text(
                    'Note: This invoice was generated for the SmartLease college project demo. The payment system uses a mock payment gateway and does not represent a real financial transaction.',
                    {
                        width: 480
                    }
                );

            // =====================================================
            // FOOTER
            // =====================================================

            doc
                .moveDown(2);

            doc
                .fontSize(10)
                .font('Helvetica-Bold')
                .text(
                    'Thank you for using SmartLease.',
                    {
                        align: 'center'
                    }
                );

            doc
                .fontSize(8)
                .font('Helvetica')
                .text(
                    'SmartLease AI Rental Agreement Intelligence Platform',
                    {
                        align: 'center'
                    }
                );

            // =====================================================
            // FINISH PDF
            // =====================================================

            doc.end();

            writeStream.on(
                'finish',
                () => {
                    resolve({
                        invoiceNumber,
                        fileName,
                        filePath
                    });
                }
            );

            writeStream.on(
                'error',
                (error) => {
                    reject(error);
                }
            );

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    generateInvoice
};