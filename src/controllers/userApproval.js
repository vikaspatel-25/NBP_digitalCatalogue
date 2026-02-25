import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import Company from '../models/company.model.js';
import User from '../models/approved.user.model.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { v2 as cloudinary } from 'cloudinary';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const userApprovalPagePath = path.join(__dirname, '../views/pages/userApproval.ejs');

async function userApprovalPageController(req, res) {
  try {
    const users = await Company.find({ approved: false });
    res.render(userApprovalPagePath, { users });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}

async function approveUserController(req, res) {
  try {
    const userId = req.body.userId;
    const userData = await Company.findById(userId);
    if (!userData) return res.status(404).send('User not found');

    const newUserId = uuidv4();
    const rawPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(rawPassword, 4);

    const now = new Date();

    const newUser = new User({
      companyName: userData.companyName || '',
      userName: userData.userName || '',
      email: userData.email,
      mobile: userData.mobile,
      document: userData.document && typeof userData.document === 'object'
        ? userData.document
        : { url: '', public_id: '' },
      userId: newUserId,
      password: hashedPassword,
      passwordUpdatedAt: now,
      passKey: rawPassword,
      role: 'user',
      status: 'active'
    });

    await newUser.save();

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: userData.email,
      subject: 'Your NetZero Mart Account Has Been Approved',
      html: `
      <div style="margin:0;padding:0;background:#f2f4f8;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
          <div style="background:#111827;padding:24px;text-align:center;color:#ffffff;">
            <h1 style="margin:0;font-size:20px;font-weight:600;">NetZero Mart</h1>
            <p style="margin:6px 0 0 0;font-size:13px;opacity:0.8;">Your Account Has Been Approved</p>
          </div>
          <div style="padding:30px;">
            <h2 style="margin-top:0;color:#111827;font-size:18px;">Welcome, ${userData.userName || userData.email}!</h2>
            <p style="font-size:14px;color:#4b5563;line-height:1.6;">
              Your registration with NetZero Mart has been successfully approved. You can now log in using the credentials below.
            </p>
            <p style="font-size:14px;color:#4b5563;line-height:1.6;">
              <strong>Your Temporary Pass Key:</strong> <span style="display:inline-block;padding:6px 12px;background:#f3f4f6;border-radius:6px;font-family:monospace;font-size:14px;">${rawPassword}</span>
            </p>
            <p style="font-size:14px;color:#4b5563;line-height:1.6;">
              For security, please log in and update your password immediately.
            </p>
            <div style="margin-top:20px;text-align:center;">
              <a href="${process.env.FRONTEND_URL || '#'}" style="background:#111827;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;">Log In</a>
            </div>
          </div>
          <div style="background:#f9fafb;padding:18px;text-align:center;font-size:12px;color:#9ca3af;">
            © ${new Date().getFullYear()} NetZero Mart. All rights reserved.
          </div>
        </div>
      </div>
      `
    });

    await Company.findByIdAndDelete(userId);

    res.redirect('/admin/userApproval');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}

async function rejectUserController(req, res) {
  try {
    const userId = req.body.userId;
    const userData = await Company.findById(userId);

    if (userData) {
      if (userData.document && userData.document.public_id) {
        try {
          const destroyResponse = await cloudinary.uploader.destroy(userData.document.public_id);
        } catch (cloudErr) {
        }
      }

      const emailResponse = await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: userData.email,
        subject: 'Update on Your NetZero Mart Registration',
        html: `
        <div style="margin:0;padding:0;background:#f2f4f8;font-family:Arial,Helvetica,sans-serif;">
          <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
            <div style="background:#111827;padding:24px;text-align:center;color:#ffffff;">
              <h1 style="margin:0;font-size:20px;font-weight:600;">NetZero Mart</h1>
              <p style="margin:6px 0 0 0;font-size:13px;opacity:0.8;">Registration Status Update</p>
            </div>
            <div style="padding:30px;">
              <h2 style="margin-top:0;color:#111827;font-size:18px;">Application Not Approved</h2>
              <p style="font-size:14px;color:#4b5563;line-height:1.6;">
                Thank you for your interest in joining NetZero Mart. After careful review, we regret to inform you that your registration request could not be approved at this time.
              </p>
              <p style="font-size:14px;color:#4b5563;line-height:1.6;">
                If you believe this decision was made in error or would like further clarification, please feel free to contact our support team.
              </p>
            </div>
            <div style="background:#f9fafb;padding:18px;text-align:center;font-size:12px;color:#9ca3af;">
              © ${new Date().getFullYear()} NetZero Mart. All rights reserved.
            </div>
          </div>
        </div>
        `
      });
    }

    await Company.findByIdAndDelete(userId);
    res.redirect('/admin/userApproval');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}

export { userApprovalPageController, approveUserController, rejectUserController };