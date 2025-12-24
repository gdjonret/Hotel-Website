const nodemailer = require('nodemailer');

/**
 * Create email transporter using environment variables
 */
const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  };

  return nodemailer.createTransporter(config);
};

/**
 * Send contact form email
 * @param {Object} formData - Contact form data
 * @param {string} formData.name - Customer name
 * @param {string} formData.email - Customer email
 * @param {string} formData.phone - Customer phone
 * @param {string} formData.message - Customer message
 */
const sendContactEmail = async (formData) => {
  const { name, email, phone, message } = formData;

  // Validate required environment variables
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  Email configuration missing. Skipping email send.');
    return { success: false, error: 'Email not configured' };
  }

  try {
    const transporter = createTransporter();

    // Email to hotel staff
    const mailOptions = {
      from: `"${name}" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
      replyTo: email,
      subject: `Nouveau message de contact - Hôtel Le Process`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0f6f44 0%, #0a4f30 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: bold; color: #0f6f44; margin-bottom: 5px; }
            .value { background: white; padding: 12px; border-radius: 4px; border-left: 3px solid #0f6f44; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Hôtel Le Process</h1>
              <p style="margin: 10px 0 0;">Nouveau message de contact</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Nom :</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">Email :</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              <div class="field">
                <div class="label">Téléphone :</div>
                <div class="value">${phone || 'Non fourni'}</div>
              </div>
              <div class="field">
                <div class="label">Message :</div>
                <div class="value">${message.replace(/\n/g, '<br>')}</div>
              </div>
              <div class="footer">
                <p>Ce message a été envoyé depuis le formulaire de contact du site web Hôtel Le Process</p>
                <p>Date : ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Ndjamena' })}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Nouveau message de contact - Hôtel Le Process

Nom: ${name}
Email: ${email}
Téléphone: ${phone || 'Non fourni'}

Message:
${message}

---
Date: ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Ndjamena' })}
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Contact email sent:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending contact email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendContactEmail
};
