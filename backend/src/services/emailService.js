const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: `"APPE Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your APPE account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2 style="color: #0077b6;">Welcome to APPE 👋</h2>
        <p>Thanks for signing up. Please verify your email address to activate your account.</p>
        <a href="${verifyUrl}" 
           style="display:inline-block; padding: 12px 24px; background-color: #0077b6;
                  color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Verify My Email
        </a>
        <p style="color: #888; font-size: 13px;">This link expires in <strong>30 minutes</strong>.</p>
        <p style="color: #888; font-size: 13px;">If you did not create an account, you can safely ignore this email.</p>
      </div>
    `
  });
};

module.exports = { sendVerificationEmail };
