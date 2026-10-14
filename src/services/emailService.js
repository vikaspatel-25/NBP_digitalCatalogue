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
export async function sendManualPaymentSubmittedEmail({ to, userName, companyName, plan, amount, utrNumber }) {
  try {
    const planName = plan === 'yearly_2400' ? 'Enterprise Annual Plan (₹2,400/yr)' : 'Standard Annual Plan (₹1,200/yr)';

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
    const planName = plan === 'yearly_2400' ? 'Enterprise Annual Plan (₹2,400/yr)' : 'Standard Annual Plan (₹1,200/yr)';

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
