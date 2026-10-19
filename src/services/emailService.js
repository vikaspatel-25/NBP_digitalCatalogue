import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const adminEmail = (process.env.ADMIN_GMAIL || 'netzeromart@gmail.com').trim();
const appName = 'NetZeroMart';
const storeUrl = process.env.FRONTEND_URL || 'https://www.netzeromart.com';

/**
 * 1. Vendor submits UTR & Screenshot -> Email to Vendor (Awaiting review) + Alert to Admin
 */
export async function sendManualPaymentSubmittedEmail({ to, userName, companyName, plan, planName: explicitPlanName, amount, utrNumber }) {
  try {
    const planName = explicitPlanName || (plan ? String(plan).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Annual Subscription');

    const vendorMail = {
      from: `"${appName}" <${process.env.GMAIL_USER}>`,
      to,
      subject: `⏳ Payment Received for Verification - ${appName}`,
      html: `
        <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
          <div style="max-width:600px;margin:30px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
            <div style="background:#0f172a;padding:24px;text-align:center;color:#ffffff;">
              <h1 style="margin:0;font-size:20px;">${appName}</h1>
              <p style="margin:6px 0 0;font-size:13px;color:#94a3b8;">Payment Verification in Progress</p>
            </div>
            <div style="padding:28px 24px;color:#1e293b;">
              <h2 style="font-size:18px;margin-top:0;">Hello ${userName || companyName},</h2>
              <p style="font-size:14px;line-height:1.6;color:#475569;">
                Thank you for submitting your annual subscription payment. Our finance team is reviewing your UTR reference against our bank records.
              </p>
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:20px 0;font-size:13px;">
                <p style="margin:4px 0;"><strong>Plan:</strong> ${planName}</p>
                <p style="margin:4px 0;"><strong>Amount:</strong> ₹${amount}</p>
                <p style="margin:4px 0;"><strong>UTR / Reference ID:</strong> <span style="font-family:monospace;font-weight:bold;">${utrNumber}</span></p>
                <p style="margin:4px 0;"><strong>Status:</strong> <span style="color:#d97706;font-weight:bold;">Under Verification</span></p>
              </div>
              <p style="font-size:13px;color:#64748b;">
                Verification typically completes within a few hours. Once confirmed, your annual catalogue listings will be activated immediately and you will receive your confirmation receipt.
              </p>
            </div>
            <div style="background:#f8fafc;padding:16px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;">
              © ${new Date().getFullYear()} ${appName}.
            </div>
          </div>
        </div>
      `
    };

    const adminMail = {
      from: `"${appName} Bot" <${process.env.GMAIL_USER}>`,
      to: adminEmail,
      subject: `🔔 [Action Required] New ₹${amount} Payment Submitted by ${companyName || userName}`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;color:#1e293b;">
          <h3>New Offline UPI Payment Submitted for Verification</h3>
          <p><strong>Vendor:</strong> ${companyName || userName} (${to})</p>
          <p><strong>Selected Plan:</strong> ${planName}</p>
          <p><strong>Amount:</strong> ₹${amount}</p>
          <p><strong>UTR / Transaction ID:</strong> <code>${utrNumber}</code></p>
          <p>Please check your bank statement and approve or reject this request in the Admin Console.</p>
          <p><a href="${storeUrl}/admin/paymentRequests" style="display:inline-block;padding:10px 18px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:6px;font-size:13px;">Open Payment Approval Desk</a></p>
        </div>
      `
    };

    await Promise.allSettled([
      transporter.sendMail(vendorMail),
      transporter.sendMail(adminMail)
    ]);
  } catch (error) {
    console.error('Failed to dispatch payment submitted email:', error?.message || error);
  }
}

/**
 * 2. Admin Approves Payment -> Official Activation Email with Quotas & Expiry Date
 */
export async function sendManualPaymentApprovedEmail({
  to,
  companyName,
  userName,
  plan,
  planName: explicitPlanName,
  amount,
  utrNumber,
  paymentDate,
  expiresAt,
  productMonthlyLimit,
  articleMonthlyLimit
}) {
  try {
    const formattedDate = new Date(expiresAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const formattedPaymentDate = new Date(paymentDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const planName = explicitPlanName || (plan ? String(plan).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Annual Subscription');

    const mailOptions = {
      from: `"${appName}" <${process.env.GMAIL_USER}>`,
      to,
      subject: `✅ Payment Approved: Your Annual Subscription is Active! - ${appName}`,
      html: `
        <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
          <div style="max-width:600px;margin:30px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
            <div style="background:#0f172a;padding:24px;text-align:center;color:#ffffff;">
              <h1 style="margin:0;font-size:20px;">${appName}</h1>
              <p style="margin:6px 0 0;font-size:13px;color:#94a3b8;">Subscription Activation & Invoice Receipt</p>
            </div>
            <div style="padding:28px 24px;color:#1e293b;">
              <h2 style="font-size:18px;margin-top:0;">Congratulations, ${companyName || userName}!</h2>
              <p style="font-size:14px;line-height:1.6;color:#475569;">
                Your payment of <strong>₹${amount}</strong> has been verified. Your annual digital catalogue is active and fully discoverable by buyers worldwide.
              </p>
              
              <div style="background:#f1f5f9;border-left:4px solid #10b981;border-radius:6px;padding:16px;margin:20px 0;font-size:13px;">
                <table style="width:100%;border-collapse:collapse;color:#334155;">
                  <tr>
                    <td style="padding:4px 0;color:#64748b;">Plan:</td>
                    <td style="padding:4px 0;font-weight:bold;text-align:right;">${planName}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:#64748b;">Payment Date:</td>
                    <td style="padding:4px 0;text-align:right;">${formattedPaymentDate}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:#64748b;">UTR Reference:</td>
                    <td style="padding:4px 0;font-family:monospace;text-align:right;">${utrNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:#64748b;">Valid Until:</td>
                    <td style="padding:4px 0;font-weight:bold;color:#10b981;text-align:right;">${formattedDate} (365 Days)</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:#64748b;">Monthly Product Quota:</td>
                    <td style="padding:4px 0;font-weight:bold;text-align:right;">${productMonthlyLimit} Products / month</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:#64748b;">Monthly Article Quota:</td>
                    <td style="padding:4px 0;font-weight:bold;text-align:right;">${articleMonthlyLimit} Articles / month</td>
                  </tr>
                </table>
              </div>

              <div style="text-align:center;margin-top:24px;">
                <a href="${storeUrl}/userPanel" style="display:inline-block;padding:12px 24px;background:#0f172a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;border-radius:8px;">Open Vendor Dashboard</a>
              </div>
            </div>
            <div style="background:#f8fafc;padding:16px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;">
              © ${new Date().getFullYear()} ${appName}. Thank you for partnering with us.
            </div>
          </div>
        </div>
      `
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send payment approved email:', error?.message || error);
  }
}

/**
 * 3. Admin Rejects Payment
 */
export async function sendManualPaymentRejectedEmail({ to, companyName, userName, utrNumber, reason }) {
  try {
    const mailOptions = {
      from: `"${appName}" <${process.env.GMAIL_USER}>`,
      to,
      subject: `⚠️ Payment Verification Update - ${appName}`,
      html: `
        <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
          <div style="max-width:600px;margin:30px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
            <div style="background:#991b1b;padding:24px;text-align:center;color:#ffffff;">
              <h1 style="margin:0;font-size:20px;">${appName}</h1>
              <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">Payment Verification Issue</p>
            </div>
            <div style="padding:28px 24px;color:#1e293b;">
              <h2 style="font-size:18px;margin-top:0;">Hello ${userName || companyName},</h2>
              <p style="font-size:14px;line-height:1.6;color:#475569;">
                Our accounts team could not verify the payment submitted with UTR reference: <code>${utrNumber}</code>.
              </p>
              <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px;margin:20px 0;font-size:13px;color:#991b1b;">
                <strong>Reason:</strong> ${reason || 'Payment record not found on bank statement.'}
              </div>
              <p style="font-size:13px;color:#64748b;">
                Please re-check your bank reference or contact our accounts team at <a href="mailto:${adminEmail}">${adminEmail}</a>. You can submit a corrected UTR anytime from your dashboard.
              </p>
              <div style="text-align:center;margin-top:20px;">
                <a href="${storeUrl}/userPanel/subscription" style="display:inline-block;padding:10px 20px;background:#0f172a;color:#ffffff;text-decoration:none;font-size:13px;border-radius:6px;">Re-submit Payment Details</a>
              </div>
            </div>
          </div>
        </div>
      `
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send payment rejected email:', error?.message || error);
  }
}

/**
 * 4. Subscription Expiring Warning (Sent 30 days & 7 days before expiry)
 */
export async function sendExpirationReminderEmail({ to, companyName, userName, expiresAt, daysLeft }) {
  try {
    const formattedDate = new Date(expiresAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const mailOptions = {
      from: `"${appName}" <${process.env.GMAIL_USER}>`,
      to,
      subject: `⏳ Notice: Your ${appName} Annual Subscription Expires in ${daysLeft} Days`,
      html: `
        <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
          <div style="max-width:600px;margin:30px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
            <div style="background:#0f172a;padding:24px;text-align:center;color:#ffffff;">
              <h1 style="margin:0;font-size:20px;">${appName}</h1>
              <p style="margin:6px 0 0;font-size:13px;color:#94a3b8;">Annual Renewal Notice</p>
            </div>
            <div style="padding:28px 24px;color:#1e293b;">
              <h2 style="font-size:18px;margin-top:0;">Hello ${userName || companyName},</h2>
              <p style="font-size:14px;line-height:1.6;color:#475569;">
                Your annual digital catalogue subscription will conclude on <strong>${formattedDate}</strong> (${daysLeft} days remaining).
              </p>
              <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px;margin:20px 0;font-size:13px;color:#92400e;">
                To ensure uninterrupted listing visibility for your sustainable products, please submit your renewal via UPI before ${formattedDate}.
              </div>
              <div style="text-align:center;margin-top:20px;">
                <a href="${storeUrl}/userPanel/subscription" style="display:inline-block;padding:12px 24px;background:#0f172a;color:#ffffff;text-decoration:none;font-size:13px;font-weight:bold;border-radius:6px;">Renew Annual Subscription</a>
              </div>
            </div>
          </div>
        </div>
      `
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send expiration reminder email:', error?.message || error);
  }
}

/**
 * 5. Admin Login Two-Factor OTP Dispatch
 */
export async function sendAdminLoginOtpEmail({ to, otp }) {
  const recipient = to || adminEmail;
  console.log(`[Admin Login OTP] Dispatching 6-digit code to ${recipient}: ${otp}`);

  try {
    const mailOptions = {
      from: `"${appName} Security" <${process.env.GMAIL_USER || 'noreply@netzeromart.com'}>`,
      to: recipient,
      subject: `🔐 ${otp} is your Admin Login Verification Code - ${appName}`,
      html: `
        <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
          <div style="max-width:550px;margin:30px auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 25px rgba(0,0,0,0.04);">
            <div style="background:#020617;padding:24px;text-align:center;color:#ffffff;">
              <h1 style="margin:0;font-size:20px;letter-spacing:-0.5px;">${appName} <span style="color:#60a5fa;">Admin Security</span></h1>
              <p style="margin:6px 0 0;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:bold;">Two-Factor Session Authorization</p>
            </div>
            <div style="padding:32px 28px;color:#0f172a;text-align:center;">
              <h2 style="font-size:18px;margin-top:0;font-weight:800;color:#0f172a;">Administrator Sign In Request</h2>
              <p style="font-size:14px;line-height:1.6;color:#475569;margin-bottom:24px;">
                A master console sign-in attempt was initiated for your NetZeroMart administrator account. Use the one-time verification passkey below to complete authorization:
              </p>
              
              <div style="display:inline-block;padding:16px 36px;background:#f1f5f9;border:2px dashed #cbd5e1;border-radius:12px;margin:10px auto 24px;">
                <span style="font-family:'Courier New',Courier,monospace;font-size:32px;font-weight:900;letter-spacing:8px;color:#0f172a;">${otp}</span>
              </div>

              <p style="font-size:12px;color:#64748b;line-height:1.5;">
                ⏱ This code will expire in <strong>10 minutes</strong>.<br />
                If you did not request this authorization code, someone may be attempting to access your portal. Please review your credentials immediately.
              </p>
            </div>
            <div style="background:#f8fafc;padding:16px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;">
              © ${new Date().getFullYear()} ${appName} System Security.
            </div>
          </div>
        </div>
      `
    };

    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      return await transporter.sendMail(mailOptions);
    } else {
      console.warn('[Admin Login OTP] GMAIL credentials not configured in environment, logged OTP to console above.');
      return { accepted: [recipient] };
    }
  } catch (error) {
    console.error('Failed to dispatch admin login OTP email:', error?.message || error);
    // Return gracefully so local dev or sandbox isn't completely blocked
    return { accepted: [recipient], fallback: true };
  }
}

/**
 * 6. Vendor Registration Business Email Verification OTP Dispatch
 */
export async function sendRegistrationOtpEmail({ to, otp, userName, companyName }) {
  console.log(`[Registration OTP] Dispatching 6-digit code to ${to}: ${otp}`);

  try {
    const mailOptions = {
      from: `"${appName}" <${process.env.GMAIL_USER || 'noreply@netzeromart.com'}>`,
      to,
      subject: `🔐 Verify Your Business Email: ${otp} - ${appName}`,
      html: `
        <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
          <div style="max-width:550px;margin:30px auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 25px rgba(0,0,0,0.04);">
            <div style="background:#0f172a;padding:24px;text-align:center;color:#ffffff;">
              <h1 style="margin:0;font-size:20px;letter-spacing:-0.5px;">${appName}</h1>
              <p style="margin:6px 0 0;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:bold;">Vendor Onboarding Verification</p>
            </div>
            <div style="padding:32px 28px;color:#0f172a;text-align:center;">
              <h2 style="font-size:18px;margin-top:0;font-weight:800;color:#0f172a;">Welcome to NetZeroMart, ${companyName || userName || 'Vendor Partner'}!</h2>
              <p style="font-size:14px;line-height:1.6;color:#475569;margin-bottom:24px;">
                Thank you for applying to list on our Sustainable B2B Digital Catalogue. Please verify your business email address using the one-time code below to submit your registration:
              </p>
              
              <div style="display:inline-block;padding:16px 36px;background:#eff6ff;border:2px dashed #93c5fd;border-radius:12px;margin:10px auto 24px;">
                <span style="font-family:'Courier New',Courier,monospace;font-size:32px;font-weight:900;letter-spacing:8px;color:#1d4ed8;">${otp}</span>
              </div>

              <p style="font-size:12px;color:#64748b;line-height:1.5;">
                ⏱ This verification code is valid for <strong>15 minutes</strong>.<br />
                Once verified, your profile will be submitted to our administrative team for review and approval.
              </p>
            </div>
            <div style="background:#f8fafc;padding:16px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;">
              © ${new Date().getFullYear()} ${appName} B2B Trade Directory.
            </div>
          </div>
        </div>
      `
    };

    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      return await transporter.sendMail(mailOptions);
    } else {
      console.warn('[Registration OTP] GMAIL credentials not configured in environment, logged OTP to console above.');
      return { accepted: [to] };
    }
  } catch (error) {
    console.error('Failed to dispatch registration OTP email:', error?.message || error);
    return { accepted: [to], fallback: true };
  }
}

