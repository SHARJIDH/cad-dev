/**
 * Email service for sending notifications
 * Uses Resend or email service provider
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send an email invitation
 */
export async function sendInviteEmail(
  recipientEmail: string,
  projectName: string,
  senderName: string,
  inviteToken: string,
  inviteUrl: string
) {
  try {
    // Template for invite email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; margin-bottom: 20px;">You're Invited to ${projectName}</h2>
        
        <p style="color: #666; line-height: 1.6;">
          Hi there,
        </p>
        
        <p style="color: #666; line-height: 1.6;">
          <strong>${senderName}</strong> has invited you to collaborate on the project
          <strong>"${projectName}"</strong> using ArcForge.
        </p>
        
        <p style="color: #666; line-height: 1.6; margin-top: 30px;">
          Click the button below to accept the invitation:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteUrl}" style="
            display: inline-block;
            background: linear-gradient(to right, #9333ea, #3b82f6);
            color: white;
            padding: 12px 30px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
          ">
            Accept Invitation
          </a>
        </div>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">
          This invitation will expire in 7 days.
        </p>
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          © 2026 ArcForge. All rights reserved.
        </p>
      </div>
    `;

    // Send email using your preferred email service
    // This example uses Resend (replace with your service)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY || ''}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@arcforge.ai',
        to: recipientEmail,
        subject: `${senderName} invited you to ${projectName}`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      console.warn('Email service not configured, invite created but email not sent');
      return { success: false, reason: 'Email service not configured' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending invite email:', error);
    return { success: false, reason: 'Failed to send email' };
  }
}

/**
 * Send a project access notification
 */
export async function sendProjectAccessEmail(
  recipientEmail: string,
  projectName: string,
  role: string,
  projectUrl: string
) {
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; margin-bottom: 20px;">Welcome to ${projectName}</h2>
        
        <p style="color: #666; line-height: 1.6;">
          You have been granted <strong>${role}</strong> access to the project
          <strong>"${projectName}"</strong> on ArcForge.
        </p>
        
        <p style="color: #666; line-height: 1.6; margin-top: 20px;">
          Go to your dashboard to get started:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${projectUrl}" style="
            display: inline-block;
            background: linear-gradient(to right, #9333ea, #3b82f6);
            color: white;
            padding: 12px 30px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
          ">
            Open Project
          </a>
        </div>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY || ''}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@arcforge.ai',
        to: recipientEmail,
        subject: `You now have access to ${projectName}`,
        html: emailHtml,
      }),
    });

    return { success: response.ok };
  } catch (error) {
    console.error('Error sending access email:', error);
    return { success: false };
  }
}
