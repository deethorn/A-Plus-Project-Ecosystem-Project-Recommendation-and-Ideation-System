const brevo = require('@getbrevo/brevo');

const defaultClient = brevo.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const transactionalEmailsApi = new brevo.TransactionalEmailsApi();

const sendVerificationEmail = async (email, token) => {
  const baseUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL;

  if (!baseUrl) {
    throw new Error('Missing CLIENT_URL or FRONTEND_URL in environment variables');
  }

  if (!process.env.BREVO_API_KEY) {
    throw new Error('Missing BREVO_API_KEY in environment variables');
  }

  if (!process.env.EMAIL_USER) {
    throw new Error('Missing EMAIL_USER in environment variables');
  }

  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

  const sendSmtpEmail = new brevo.SendSmtpEmail();
  sendSmtpEmail.subject = 'Verify your APPE account';
  sendSmtpEmail.htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
      <h2 style="color: #0077b6;">Welcome to APPE</h2>
      <p>Thanks for signing up. Please verify your email address to activate your account.</p>
      <a href="${verifyUrl}" 
         style="display:inline-block; padding: 12px 24px; background-color: #0077b6;
                color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Verify My Email
      </a>
      <p style="color: #888; font-size: 13px;">This link expires in <strong>30 minutes</strong>.</p>
      <p style="color: #888; font-size: 13px;">If you did not create an account, you can safely ignore this email.</p>
    </div>
  `;
  sendSmtpEmail.sender = {
    name: 'APPE Platform',
    email: process.env.EMAIL_USER
  };
  sendSmtpEmail.to = [
    {
      email
    }
  ];

  try {
    const response = await transactionalEmailsApi.sendTransacEmail(sendSmtpEmail);
    return response;
  } catch (error) {
    const message =
      error?.response?.body?.message ||
      error?.message ||
      'Failed to send verification email';

    throw new Error(message);
  }
};

module.exports = { sendVerificationEmail };