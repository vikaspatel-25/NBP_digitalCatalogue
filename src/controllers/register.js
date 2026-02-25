import { v2 as cloudinary } from 'cloudinary';
import User from '../models/company.model.js';

export const registerPageController = async (req, res) => {
  try {
    return res.render('pages/register', { error: null, success: null });
  } catch (error) {
    return res.status(500).send('Internal Server Error');
  }
};

export const registerCompany = async (req, res) => {
  try {
    const { userName, companyName, mobile, email } = req.body;

    // Ensure required fields exist
    if (!userName || !companyName || !mobile || !email) {
      return res.render('pages/register', {
        error: 'All required fields must be provided.',
        success: null
      });
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

    // Prepare user object for Mongo
    const userData = {
      userName,
      companyName,
      mobile,
      email
    };

    if (documentData) {
      userData.document = documentData;
    }

    // Create user
    await User.create(userData);

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
    return res.render('pages/register', {
      error: 'Something went wrong. Please try again later.',
      success: null
    });
  }
};