import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Test the transporter configuration
export const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log('SMTP transporter verified successfully');
    return true;
  } catch (error) {
    console.error('SMTP transporter verification failed:', error);
    return false;
  }
};

export const sendVerificationEmail = async (user) => {
  try {
    // Validate required environment variables
    if (!process.env.BACKEND_URL || !process.env.EMAIL_FROM) {
      throw new Error('Missing required environment variables: BACKEND_URL or EMAIL_FROM');
    }

    // Validate user object
    if (!user || !user.email || !user.emailVerificationToken) {
      throw new Error('Invalid user object: missing email or verification token');
    }

    const verificationUrl = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${user.emailVerificationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Verify Your Email Address',
      html: `
        <div>
          <h2>Welcome to User Management System</h2>
          <p>Please click the link below to verify your email address:</p>
          <a href="${verificationUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
          <p>Or copy and paste this link in your browser:</p>
          <p>${verificationUrl}</p>
        </div>
      `,
    };

    console.log(`Attempting to send verification email to: ${user.email}`);
    console.log(`Using SMTP host: ${process.env.SMTP_HOST}`);
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent successfully to ${user.email}`, info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Error sending verification email:', {
      to: user?.email,
      error: error.message,
      responseCode: error.responseCode,
      code: error.code,
      command: error.command
    });
    
    // Handle specific error types 
    if (error.code === 'ECONNREFUSED') {
      console.error('SMTP connection refused. Check your SMTP_HOST and SMTP_PORT.');
    } else if (error.responseCode === 535) {
      console.error('Authentication failed. Check your SMTP_USER and SMTP_PASSWORD.');
    } else if (error.code === 'ENOTFOUND') {
      console.error('SMTP host not found. Check your SMTP_HOST configuration.');
    } else if (error.code === 'EAUTH') {
      console.error('Authentication failed. Invalid SMTP credentials.');
    }
    
    return { success: false, error: error.message };
  }
};