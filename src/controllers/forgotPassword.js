// Reminder: Only minimal changes made to read email from URL query for forgot password

import 'dotenv/config';
import Admin from '../models/admin.model.js';
import User from '../models/user.model.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

async function adminForgotPassword(req, res) {
  try {
    // Get email from URL query instead of hardcoded
    const email = req.query.gmail?.trim();
    if (!email) return res.status(400).send('Gmail address is required');

    const admin = await Admin.findOne({});
    if (!admin) return res.status(404).send('Admin record not found');

    const passKey = admin.passKey;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'NetZero Mart Admin Passkey',
      html: `
        <div style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
          <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 12px 30px rgba(0,0,0,0.08);">
            <div style="background:#111827;padding:24px;text-align:center;color:#ffffff;">
              <h1 style="margin:0;font-size:20px;">NetZero Mart</h1>
              <p style="margin:6px 0 0 0;font-size:13px;opacity:0.8;">Admin Passkey Recovery</p>
            </div>
            <div style="padding:30px;text-align:center;">
              <h2 style="margin-top:0;color:#111827;font-size:18px;">Your Admin Passkey</h2>
              <p style="font-size:14px;color:#4b5563;line-height:1.6;">Use this passkey to log in to the admin panel. Keep it secure. <strong>Change your password immediately after logging in.</strong></p>
              <div style="margin:25px 0;padding:18px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;font-size:20px;font-weight:600;color:#111827;user-select:all;">${passKey}</div>
            </div>
            <div style="background:#f9fafb;padding:18px;text-align:center;font-size:12px;color:#9ca3af;">
              © ${new Date().getFullYear()} NetZero Mart. All rights reserved.
            </div>
          </div>
        </div>
      `
    });

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Passkey Sent</title>
        <style>
          body { margin:0; font-family:Arial,Helvetica,sans-serif; background:#f4f6f8; display:flex; justify-content:center; align-items:center; height:100vh; }
          .panel { max-width:560px; width:100%; background:#ffffff; border-radius:14px; padding:2rem; box-shadow:0 12px 30px rgba(0,0,0,0.08); text-align:center; }
          .panel h1 { margin-top:0; font-size:1.5rem; }
          .panel p { margin:1rem 0; color:#4b5563; }
          .btn { display:inline-block; padding:0.6rem 1.2rem; border-radius:8px; text-decoration:none; background:#2563eb; color:#ffffff; font-weight:500; margin-top:1rem; }
        </style>
      </head>
      <body>
        <div class="panel">
          <h1>Passkey Sent</h1>
          <p>Admin passkey has been sent successfully to <strong>${email}</strong>. <strong>Change your password immediately after logging in.</strong></p>
          <a href="/adminLogin" class="btn">Back to Login</a>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Error sending admin passkey:', err);
    res.status(500).send('Internal Server Error');
  }
}

async function userForgotPassword(req, res) {
  try {
    // Get email from URL query instead of POST body
    const email = req.query.gmail?.trim();
    if (!email) return res.status(400).send('Email is required');

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).send('User not found');

    const passKey = user.passKey;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: 'NetZero Mart User Passkey',
      html: `
        <div style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
          <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 12px 30px rgba(0,0,0,0.08);">
            <div style="background:#111827;padding:24px;text-align:center;color:#ffffff;">
              <h1 style="margin:0;font-size:20px;">NetZero Mart</h1>
              <p style="margin:6px 0 0 0;font-size:13px;opacity:0.8;">Account Passkey Recovery</p>
            </div>
            <div style="padding:30px;text-align:center;">
              <h2 style="margin-top:0;color:#111827;font-size:18px;">Your Account Passkey</h2>
              <p style="font-size:14px;color:#4b5563;line-height:1.6;">Use this passkey to log in. <strong>Reset your password immediately after logging in.</strong></p>
              <div style="margin:25px 0;padding:18px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;font-size:20px;font-weight:600;color:#111827;user-select:all;">${passKey}</div>
            </div>
            <div style="background:#f9fafb;padding:18px;text-align:center;font-size:12px;color:#9ca3af;">
              © ${new Date().getFullYear()} NetZero Mart. All rights reserved.
            </div>
          </div>
        </div>
      `
    });

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Passkey Sent</title>
        <style>
          body { margin:0; font-family:Arial,Helvetica,sans-serif; background:#f4f6f8; display:flex; justify-content:center; align-items:center; height:100vh; }
          .panel { max-width:560px; width:100%; background:#ffffff; border-radius:14px; padding:2rem; box-shadow:0 12px 30px rgba(0,0,0,0.08); text-align:center; }
          .panel h1 { margin-top:0; font-size:1.5rem; }
          .panel p { margin:1rem 0; color:#4b5563; }
          .btn { display:inline-block; padding:0.6rem 1.2rem; border-radius:8px; text-decoration:none; background:#2563eb; color:#ffffff; font-weight:500; margin-top:1rem; }
        </style>
      </head>
      <body>
        <div class="panel">
          <h1>Passkey Sent</h1>
          <p>Passkey has been sent successfully to <strong>${user.email}</strong>. <strong>Reset your password immediately after logging in.</strong></p>
          <a href="/userLogin" class="btn">Back to Login</a>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Error sending user passkey:', err);
    res.status(500).send('Internal Server Error');
  }
}

export { adminForgotPassword, userForgotPassword };
