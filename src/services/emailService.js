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
const storeUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Send email when a free 28-day trial is activated upon approval
 */
export async function sendTrialActivatedEmail({ to, userName, companyName, expiresAt }) {
  try {
    const formattedDate = new Date(expiresAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const mailOptions = {
      from: `"${appName}" <${process.env.GMAIL_USER}>`,
      to,
      subject: `🎉 Your 28-Day Free Trial is Active - ${appName}`,
      html: `
        <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
          <div style="max-width:600px;margin:30px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
            <div style="background:#0f172a;padding:24px;text-align:center;color:#ffffff;">
              <h1 style="margin:0;font-size:22px;letter-spacing:-0.5px;">${appName}</h1>
              <p style="margin:6px 0 0;font-size:13px;color:#94a3b8;">Welcome to the Digital Catalogue Marketplace</p>
            </div>
            <div style="padding:28px 24px;color:#1e293b;">
              <h2 style="font-size:18px;margin-top:0;">Hello ${userName || companyName || 'Vendor'},</h2>
              <p style="font-size:14px;line-height:1.6;color:#475569;">
                Congratulations! Your vendor account is approved, and your <strong>28-Day Free Subscription</strong> is now active.
              </p>
              <div style="background:#f1f5f9;border-left:4px solid #10b981;padding:14px 16px;border-radius:6px;margin:20px 0;">
                <p style="margin:0;font-size:13px;color:#334155;">
                  <strong>Plan:</strong> 28-Day Free Trial<br/>
                  <strong>Valid Until:</strong> ${formattedDate}<br/>
                  <strong>Public Catalogue:</strong> Active & Visible to all visitors
                </p>
              </div>
              <p style="font-size:13px;line-height:1.6;color:#64748b;">
                You can list your sustainable products and articles directly from your vendor portal. After your trial expires, you can renew anytime for just ₹49 via instant UPI.
              </p>
              <div style="text-align:center;margin-top:24px;">
                <a href="${storeUrl}/userLogin" style="display:inline-block;padding:12px 24px;background:#0f172a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;border-radius:8px;">Open Vendor Portal</a>
              </div>
            </div>
            <div style="background:#f8fafc;padding:16px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;">
              © ${new Date().getFullYear()} ${appName}. All rights reserved.
            </div>
          </div>
        </div>
      `
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send trial activated email:', error?.message || error);
  }
}

/**
 * Send email when subscription is successfully renewed/paid via Razorpay
 */
export async function sendPaymentSuccessEmail({ to, userName, companyName, planType, amount, paymentId, expiresAt }) {
  try {
    const formattedDate = new Date(expiresAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const amountRs = (amount / 100).toFixed(0);
    const planName = planType === 'yearly_365d' ? 'Yearly Plan (365 Days)' : 'Standard Plan (28 Days)';

    // 1. Email to Vendor
    const userMailOptions = {
      from: `"${appName}" <${process.env.GMAIL_USER}>`,
      to,
      subject: `✅ Payment Received: Subscription Renewed - ${appName}`,
      html: `
        <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
          <div style="max-width:600px;margin:30px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
            <div style="background:#0f172a;padding:24px;text-align:center;color:#ffffff;">
              <h1 style="margin:0;font-size:22px;">${appName}</h1>
              <p style="margin:6px 0 0;font-size:13px;color:#94a3b8;">Payment & Renewal Receipt</p>
            </div>
            <div style="padding:28px 24px;color:#1e293b;">
              <h2 style="font-size:18px;margin-top:0;">Thank You, ${userName || companyName}!</h2>
              <p style="font-size:14px;line-height:1.6;color:#475569;">
                We have successfully received your payment of <strong>₹${amountRs}</strong>. Your digital catalogue listings are active and visible on the marketplace.
              </p>
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:20px 0;">
                <table style="width:100%;font-size:13px;color:#334155;border-collapse:collapse;">
                  <tr>
                    <td style="padding:6px 0;color:#64748b;">Plan:</td>
                    <td style="padding:6px 0;font-weight:600;text-align:right;">${planName}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#64748b;">Amount Paid:</td>
                    <td style="padding:6px 0;font-weight:600;text-align:right;">₹${amountRs}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#64748b;">Payment Ref / ID:</td>
                    <td style="padding:6px 0;font-family:monospace;text-align:right;">${paymentId}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#64748b;">Subscription Valid Till:</td>
                    <td style="padding:6px 0;font-weight:600;color:#10b981;text-align:right;">${formattedDate}</td>
                  </tr>
                </table>
              </div>
              <p style="font-size:13px;color:#64748b;">
                Thank you for being a part of our sustainable vendor network!
              </p>
              <div style="text-align:center;margin-top:20px;">
                <a href="${storeUrl}/userPanel" style="display:inline-block;padding:10px 20px;background:#0f172a;color:#ffffff;text-decoration:none;font-size:13px;font-weight:bold;border-radius:6px;">Go to Vendor Dashboard</a>
              </div>
            </div>
            <div style="background:#f8fafc;padding:16px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;">
              © ${new Date().getFullYear()} ${appName}. No auto-debit will occur.
            </div>
          </div>
        </div>
      `
    };

    // 2. Alert to Admin
    const adminMailOptions = {
      from: `"${appName} Bot" <${process.env.GMAIL_USER}>`,
      to: adminEmail,
      subject: `🔔 [Admin Alert] New Subscription Payment of ₹${amountRs} from ${companyName || userName}`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;color:#1e293b;">
          <h3>New Subscription Payment Received</h3>
          <p><strong>Vendor:</strong> ${companyName || userName} (${to})</p>
          <p><strong>Plan:</strong> ${planName}</p>
          <p><strong>Amount:</strong> ₹${amountRs}</p>
          <p><strong>Razorpay Payment ID:</strong> ${paymentId}</p>
          <p><strong>New Expiration Date:</strong> ${formattedDate}</p>
        </div>
      `
    };

    await Promise.allSettled([
      transporter.sendMail(userMailOptions),
      transporter.sendMail(adminMailOptions)
    ]);
  } catch (error) {
    console.error('Failed to send payment success notification:', error?.message || error);
  }
}

/**
 * Send warning email when subscription is expiring soon or expired
 */
export async function sendSubscriptionStatusAlert({ to, userName, companyName, status, expiresAt }) {
  try {
    const isExpired = status === 'expired';
    const subject = isExpired
      ? `⚠️ Your Catalogue is now Hidden - Subscription Expired (${appName})`
      : `⏳ Reminder: Your ${appName} Subscription is Expiring Soon`;

    const mailOptions = {
      from: `"${appName}" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: `
        <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
          <div style="max-width:600px;margin:30px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
            <div style="background:${isExpired ? '#991b1b' : '#0f172a'};padding:20px;text-align:center;color:#ffffff;">
              <h2 style="margin:0;font-size:20px;">${appName}</h2>
              <p style="margin:4px 0 0;font-size:12px;opacity:0.9;">
                ${isExpired ? 'Catalogue Visibility Temporarily Suspended' : 'Subscription Expiration Notice'}
              </p>
            </div>
            <div style="padding:24px;color:#1e293b;">
              <p style="font-size:14px;color:#475569;">
                Hello <strong>${userName || companyName}</strong>,
              </p>
              ${
                isExpired
                  ? `<p style="font-size:14px;line-height:1.6;color:#dc2626;">
                      Your subscription cycle has ended. As a result, your products and articles have been temporarily hidden from the public catalogue.
                    </p>
                    <p style="font-size:13px;line-height:1.6;color:#475569;">
                      Don't worry—your data and listings are completely safe. Renew now via UPI for just ₹49 to instantly restore your listings to all customers.
                    </p>`
                  : `<p style="font-size:14px;line-height:1.6;color:#475569;">
                      Your subscription is ending soon. Renew anytime from your dashboard to maintain uninterrupted visibility for your products on NetZeroMart.
                    </p>`
              }
              <div style="text-align:center;margin:24px 0;">
                <a href="${storeUrl}/userPanel" style="display:inline-block;padding:12px 24px;background:#0f172a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;border-radius:6px;">Renew via UPI Now (₹49)</a>
              </div>
            </div>
            <div style="background:#f8fafc;padding:14px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;">
              © ${new Date().getFullYear()} ${appName}.
            </div>
          </div>
        </div>
      `
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to dispatch subscription status alert:', error?.message || error);
  }
}
