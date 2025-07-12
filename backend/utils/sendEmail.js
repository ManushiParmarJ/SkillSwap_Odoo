const nodemailer = require('nodemailer');

// Create transporter with better Gmail settings
const createTransporter = () => {
  const config = {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'manushiparmar1705@gmail.com',
      pass: process.env.EMAIL_PASS || 'manuCool111',
    },
    // Gmail settings
    secure: false, // Use TLS
    port: 587,
    tls: {
      rejectUnauthorized: false
    }
  };

  return nodemailer.createTransport(config);
};

let transporter = null;
let isDevelopmentMode = false;

// Initialize transporter with error handling
const initializeTransporter = async () => {
  try {
    transporter = createTransporter();
    
    // Verify connection
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');
    isDevelopmentMode = false;
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    
    if (error.code === 'EAUTH') {
      console.error('Gmail authentication failed. Please check:');
      console.error('1. Email and password are correct');
      console.error('2. If 2FA is enabled, use an App Password instead of regular password');
      console.error('3. Enable "Less secure app access" in Gmail settings (if 2FA is disabled)');
      console.error('4. Check the README_EMAIL_SETUP.md file for detailed instructions');
      console.log('🔄 Switching to development mode - emails will be logged instead of sent');
      isDevelopmentMode = true;
    }
    
    return false;
  }
};

// Initialize on module load
initializeTransporter();

async function sendOTPEmail(to, otp) {
  try {
    // Check if email credentials are properly configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email credentials not properly configured');
      console.log('🔄 Switching to development mode - emails will be logged instead of sent');
      isDevelopmentMode = true;
    }

    // Development mode - log email instead of sending
    if (isDevelopmentMode) {
      console.log('📧 [DEV MODE] Email would be sent:');
      console.log('   To:', to);
      console.log('   Subject: Skill Swap Platform - Password Reset OTP');
      console.log('   OTP:', otp);
      console.log('   Note: In production, configure proper email credentials');
      return true;
    }

    // Reinitialize transporter if needed
    if (!transporter) {
      const initialized = await initializeTransporter();
      if (!initialized) {
        console.error('Failed to initialize email transporter');
        return false;
      }
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: 'Skill Swap Platform - Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Skill Swap Platform</h2>
          <h3>Password Reset Request</h3>
          <p>You have requested to reset your password. Use the OTP below to complete the process:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #2563eb; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p><strong>This OTP will expire in 10 minutes.</strong></p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">This is an automated email from Skill Swap Platform.</p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error);
    
    // Provide specific guidance for common Gmail issues
    if (error.code === 'EAUTH') {
      console.error('Gmail authentication failed. Please check:');
      console.error('1. Email and password are correct');
      console.error('2. If 2FA is enabled, use an App Password instead of regular password');
      console.error('3. Enable "Less secure app access" in Gmail settings (if 2FA is disabled)');
      console.error('4. Check the README_EMAIL_SETUP.md file for detailed instructions');
    }
    
    return false;
  }
}

module.exports = sendOTPEmail; 