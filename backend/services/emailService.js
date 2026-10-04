const nodemailer = require('nodemailer');

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
      from: `"SmartLease AI" <${process.env.EMAIL_USER}>`,
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

module.exports = {
  sendVerificationOTP,
};