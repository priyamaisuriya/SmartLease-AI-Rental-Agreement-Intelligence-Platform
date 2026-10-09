const nodemailer = require('nodemailer');
const { getSettings } = require('./settingsService');

const transporter = nodemailer.createTransport({
  service: 'gmail',

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ============================================================
// VERIFY EMAIL CONFIGURATION
// ============================================================

transporter.verify((error, success) => {
  if (error) {
    console.error('========================================');
    console.error('EMAIL CONFIGURATION ERROR');
    console.error('========================================');
    console.error(error);
  } else {
    console.log('========================================');
    console.log('EMAIL SERVER READY');
    console.log('========================================');
  }
});

// ============================================================
// SEND VERIFICATION OTP
// ============================================================

const sendVerificationOTP = async (email, otp) => {
  try {
    if (!process.env.EMAIL_USER) {
      throw new Error('EMAIL_USER is missing in .env');
    }

    if (!process.env.EMAIL_PASS) {
      throw new Error('EMAIL_PASS is missing in .env');
    }

    const mailOptions = {
      from: `"${getSettings().siteName}" <${process.env.EMAIL_USER}>`,
      ...(getSettings().contactEmail ? { replyTo: getSettings().contactEmail } : {}),
      to: email,
      subject: 'SmartLease AI - Email Verification OTP',

      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Email Verification</title>
        </head>

        <body style="
          margin: 0;
          padding: 0;
          background: #f5f2ea;
          font-family: Arial, sans-serif;
        ">

          <div style="
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          ">

            <div style="
              background: #111827;
              padding: 28px;
              text-align: center;
            ">

              <h1 style="
                margin: 0;
                color: #ffffff;
                font-family: Georgia, serif;
              ">
                SmartLease <span style="color:#c9a24b;">AI</span>
              </h1>

            </div>

            <div style="padding: 35px;">

              <h2 style="
                color: #222;
                margin-top: 0;
              ">
                Verify your email
              </h2>

              <p style="
                color: #555;
                line-height: 1.6;
              ">
                Thank you for creating an account with SmartLease AI.
                Use the verification code below to verify your email address.
              </p>

              <div style="
                margin: 30px 0;
                text-align: center;
              ">

                <div style="
                  display: inline-block;
                  padding: 18px 35px;
                  background: #f8f5ed;
                  border: 1px solid #c9a24b;
                  border-radius: 8px;
                ">

                  <span style="
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    color: #111827;
                  ">
                    ${otp}
                  </span>

                </div>

              </div>

              <p style="
                color: #777;
                font-size: 14px;
                line-height: 1.6;
              ">
                This OTP is valid for <strong>5 minutes</strong>.
                Do not share this code with anyone.
              </p>

              <p style="
                color: #777;
                font-size: 14px;
              ">
                If you did not request this verification, you can safely
                ignore this email.
              </p>

            </div>

            <div style="
              padding: 20px;
              background: #fafafa;
              text-align: center;
              color: #999;
              font-size: 12px;
            ">
              © SmartLease AI — Rental Agreement Intelligence Platform
            </div>

          </div>

        </body>
        </html>
      `,
    };

    console.log('Sending OTP email...');
    console.log('From:', process.env.EMAIL_USER);
    console.log('To:', email);

    const info = await transporter.sendMail(mailOptions);

    console.log('OTP email sent successfully.');
    console.log('Message ID:', info.messageId);

    return info;

  } catch (error) {

    console.error('========================================');
    console.error('OTP EMAIL SENDING ERROR');
    console.error('========================================');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Command:', error.command);
    console.error('Response:', error.response);
    console.error('Response Code:', error.responseCode);
    console.error('========================================');

    throw error;
  }
};

// ============================================================
// SEND PAYMENT INVOICE EMAIL
// ============================================================

const sendInvoiceEmail = async ({
  email,
  tenantName,
  invoiceNumber,
  propertyTitle,
  transactionId,
  totalAmount,
  paymentMethod,
  invoicePath,
}) => {
  try {
    // ----------------------------------------------------------
    // CHECK EMAIL CONFIGURATION
    // ----------------------------------------------------------

    if (!process.env.EMAIL_USER) {
      throw new Error('EMAIL_USER is missing in .env');
    }

    if (!process.env.EMAIL_PASS) {
      throw new Error('EMAIL_PASS is missing in .env');
    }

    if (!email) {
      throw new Error(
        'Tenant email is required for invoice email'
      );
    }

    if (!invoicePath) {
      throw new Error(
        'Invoice PDF path is required'
      );
    }

    // ----------------------------------------------------------
    // EMAIL
    // ----------------------------------------------------------

    const mailOptions = {
      from: `"${getSettings().siteName}" <${process.env.EMAIL_USER}>`,
      ...(getSettings().contactEmail ? { replyTo: getSettings().contactEmail } : {}),

      to: email,

      subject:
        `SmartLease AI - Payment Invoice ${invoiceNumber}`,

      html: `
        <!DOCTYPE html>
        <html>

        <head>
          <meta charset="UTF-8">
          <title>SmartLease Payment Invoice</title>
        </head>

        <body style="
          margin: 0;
          padding: 0;
          background: #f5f2ea;
          font-family: Arial, sans-serif;
        ">

          <div style="
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          ">

            <!-- HEADER -->

            <div style="
              background: #111827;
              padding: 28px;
              text-align: center;
            ">

              <h1 style="
                margin: 0;
                color: #ffffff;
                font-family: Georgia, serif;
              ">
                SmartLease
                <span style="color:#c9a24b;">
                  AI
                </span>
              </h1>

              <p style="
                margin: 8px 0 0;
                color: #d1d5db;
                font-size: 13px;
              ">
                Rental Agreement Intelligence Platform
              </p>

            </div>

            <!-- BODY -->

            <div style="
              padding: 35px;
            ">

              <h2 style="
                color: #222;
                margin-top: 0;
              ">
                Payment Successful
              </h2>

              <p style="
                color: #555;
                line-height: 1.6;
              ">
                Dear
                <strong>
                  ${tenantName || 'Tenant'}
                </strong>,
              </p>

              <p style="
                color: #555;
                line-height: 1.6;
              ">
                Your payment for
                <strong>
                  ${propertyTitle || 'your property'}
                </strong>
                has been successfully completed.
              </p>

              <!-- PAYMENT BOX -->

              <div style="
                margin: 25px 0;
                padding: 20px;
                background: #f8f5ed;
                border: 1px solid #e5d6aa;
                border-radius: 10px;
              ">

                <p style="
                  margin: 8px 0;
                  color: #555;
                ">
                  <strong>
                    Invoice Number:
                  </strong>
                  ${invoiceNumber}
                </p>

                <p style="
                  margin: 8px 0;
                  color: #555;
                ">
                  <strong>
                    Transaction ID:
                  </strong>
                  ${transactionId}
                </p>

                <p style="
                  margin: 8px 0;
                  color: #555;
                ">
                  <strong>
                    Property:
                  </strong>
                  ${propertyTitle || 'N/A'}
                </p>

                <p style="
                  margin: 8px 0;
                  color: #555;
                ">
                  <strong>
                    Payment Method:
                  </strong>
                  ${paymentMethod || 'Mock Payment'}
                </p>

                <p style="
                  margin: 15px 0 0;
                  color: #111827;
                  font-size: 22px;
                  font-weight: bold;
                ">
                  Total Paid:
                  ₹${Number(
                    totalAmount || 0
                  ).toLocaleString('en-IN')}
                </p>

              </div>

              <p style="
                color: #555;
                line-height: 1.6;
              ">
                Your invoice is attached to this email
                as a PDF document.
              </p>

              <p style="
                color: #777;
                font-size: 13px;
                line-height: 1.6;
              ">
                Please keep this invoice for your
                records.
              </p>

              <!-- DEMO NOTICE -->

              <div style="
                margin-top: 20px;
                padding: 12px;
                background: #eff6ff;
                border: 1px solid #bfdbfe;
                border-radius: 8px;
              ">

                <p style="
                  margin: 0;
                  color: #1d4ed8;
                  font-size: 12px;
                  line-height: 1.5;
                ">
                  <strong>
                    Project Demo:
                  </strong>
                  This payment was processed through
                  the SmartLease mock payment gateway
                  for academic demonstration purposes.
                </p>

              </div>

            </div>

            <!-- FOOTER -->

            <div style="
              padding: 20px;
              background: #fafafa;
              text-align: center;
              color: #999;
              font-size: 12px;
            ">

              © SmartLease AI — Rental Agreement
              Intelligence Platform

            </div>

          </div>

        </body>
        </html>
      `,

      // --------------------------------------------------------
      // PDF INVOICE ATTACHMENT
      // --------------------------------------------------------

      attachments: [
        {
          filename:
            `${invoiceNumber}.pdf`,

          path:
            invoicePath,

          contentType:
            'application/pdf',
        },
      ],
    };

    console.log(
      '========================================'
    );

    console.log(
      'Sending invoice email...'
    );

    console.log(
      'From:',
      process.env.EMAIL_USER
    );

    console.log(
      'To:',
      email
    );

    console.log(
      'Invoice:',
      invoiceNumber
    );

    console.log(
      'Attachment:',
      invoicePath
    );

    console.log(
      '========================================'
    );

    const info =
      await transporter.sendMail(
        mailOptions
      );

    console.log(
      'Invoice email sent successfully.'
    );

    console.log(
      'Message ID:',
      info.messageId
    );

    return info;

  } catch (error) {

    console.error(
      '========================================'
    );

    console.error(
      'INVOICE EMAIL SENDING ERROR'
    );

    console.error(
      '========================================'
    );

    console.error(
      'Message:',
      error.message
    );

    console.error(
      'Code:',
      error.code
    );

    console.error(
      'Command:',
      error.command
    );

    console.error(
      'Response:',
      error.response
    );

    console.error(
      'Response Code:',
      error.responseCode
    );

    console.error(
      '========================================'
    );

    throw error;
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  sendVerificationOTP,
  sendInvoiceEmail,
};