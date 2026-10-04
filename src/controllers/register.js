import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import Company from '../models/company.model.js';
import ApprovedUser from '../models/approved.user.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const reactIndexPath = path.resolve(process.cwd(), 'frontend/dist/index.html');

export const registerPageController = async (req, res) => {
  try {
    return res.sendFile(reactIndexPath);
  } catch (error) {
    return res.status(500).send('Internal Server Error');
  }
};

export const checkEmailAvailability = async (req, res) => {
  try {
    const rawEmail = req.query.email || req.body?.email || '';
    const email = String(rawEmail).trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ available: false, error: 'Email parameter is required.' });
    }

    if (mongoose.connection.readyState === 1) {
      const [existingCompany, existingApproved] = await Promise.all([
        Company.findOne({ email }),
        ApprovedUser.findOne({ email })
      ]);

      if (existingApproved) {
        return res.json({
          available: false,
          message: 'An approved vendor account with this email address already exists. Please sign in instead.'
        });
      }

      if (existingCompany) {
        return res.json({
          available: false,
          message: 'A vendor application with this email address has already been submitted and is awaiting administrator review.'
        });
      }
    }

    return res.json({
      available: true,
      message: 'Email is available for registration.'
    });
  } catch (error) {
    console.error('Error checking email availability:', error);
    return res.status(500).json({
      available: false,
      error: 'Unable to verify email availability at this time.'
    });
  }
};

export const registerCompany = async (req, res) => {
  const isJsonRequest = Boolean(
    req.xhr ||
    req.is('json') ||
    (req.headers.accept && req.headers.accept.includes('application/json')) ||
    req.headers['content-type']?.includes('multipart/form-data')
  );

  try {
    const { userName, companyName, mobile, email } = req.body;

    // Ensure required fields exist
    if (!userName || !companyName || !mobile || !email) {
      const requiredMsg = 'All required fields (Contact Name, Company Name, Mobile Number, Email) must be provided.';
      if (isJsonRequest) {
        return res.status(400).json({
          success: false,
          error: requiredMsg,
          message: requiredMsg
        });
      }
      return res.render('pages/register', {
        error: requiredMsg,
        success: null
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (mongoose.connection.readyState === 1) {
      const [existingCompany, existingApproved] = await Promise.all([
        Company.findOne({ email: normalizedEmail }),
        ApprovedUser.findOne({ email: normalizedEmail })
      ]);

      if (existingApproved) {
        const errorMsg = 'An approved vendor account with this email address already exists. Please sign in instead.';
        if (isJsonRequest) {
          return res.status(400).json({
            success: false,
            error: errorMsg,
            message: errorMsg
          });
        }
        return res.render('pages/register', {
          error: errorMsg,
          success: null
        });
      }

      if (existingCompany) {
        const errorMsg = 'A vendor application with this email address has already been submitted and is awaiting administrator review.';
        if (isJsonRequest) {
          return res.status(400).json({
            success: false,
            error: errorMsg,
            message: errorMsg
          });
        }
        return res.render('pages/register', {
          error: errorMsg,
          success: null
        });
      }
    }

    let documentData = undefined;

    // Upload document to Cloudinary if provided
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'company_documents',
            access_mode: 'public'
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      documentData = {
        url: uploadResult.secure_url || '',
        public_id: uploadResult.public_id || ''
      };
    }

    // Prepare company object for Mongo
    const userData = {
      userName: userName.trim(),
      companyName: companyName.trim(),
      mobile: mobile.trim(),
      email: normalizedEmail
    };

    if (documentData) {
      userData.document = documentData;
    }

    // Create pending vendor registration record
    await Company.create(userData);

    if (isJsonRequest) {
      return res.json({
        success: true,
        message: 'Registration submitted successfully. Our administration team will review and approve your vendor profile shortly.'
      });
    }

    return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Registration Submitted</title>
  <style>
    :root { --bg: #f4f6f8; --panel: #ffffff; --border: #e5e7eb; --text: #1f2937; --muted: #6b7280; --header-bg: #1e3a8a; --header-text: #ffffff; --primary: #2563eb; --primary-hover: #1e4ed8; --secondary-bg: #e5e7eb; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; background: var(--bg); font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: var(--text); display: flex; justify-content: center; align-items: flex-start; padding: 8vh 1rem; }
    .panel { width: 100%; max-width: 560px; background: var(--panel); border-radius: 14px; overflow: hidden; box-shadow: 0 12px 30px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.05); }
    .panel-header { padding: 1.7rem 2.2rem; background: var(--header-bg); color: var(--header-text); }
    .panel-header h1 { margin: 0; font-size: 1.35rem; font-weight: 600; }
    .panel-body { padding: 2rem 2.2rem; }
    .panel-body h2 { margin-top: 0; font-size: 1.1rem; font-weight: 600; }
    .panel-body p { font-size: 0.9rem; color: var(--muted); margin-bottom: 1.8rem; line-height: 1.5; }
    .btn { display: inline-block; padding: 0.65rem 1.2rem; border-radius: 8px; text-decoration: none; font-size: 0.85rem; font-weight: 500; margin-right: 0.6rem; }
    .btn-primary { background: var(--primary); color: #ffffff; }
    .btn-primary:hover { background: var(--primary-hover); }
    .btn-secondary { background: var(--secondary-bg); color: var(--text); }
  </style>
</head>
<body>
  <div class="panel">
    <div class="panel-header">
      <h1>Registration Submitted</h1>
    </div>
    <div class="panel-body">
      <h2>Application Received</h2>
      <p>Our team will look into your profile and approve it shortly if everything is correct.</p>
      <a href="/register" class="btn btn-primary">Register Again</a>
      <a href="/home" class="btn btn-secondary">Back to Home</a>
    </div>
  </div>
</body>
</html>`);

  } catch (error) {
    console.error('Error registering company:', error);
    if (isJsonRequest) {
      return res.status(500).json({
        success: false,
        error: 'Something went wrong processing your registration. Please try again later.'
      });
    }
    return res.render('pages/register', {
      error: 'Something went wrong. Please try again later.',
      success: null
    });
  }
};