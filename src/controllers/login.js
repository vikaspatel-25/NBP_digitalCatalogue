import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";
import Users from "../models/user.model.js";
import bcrypt from "bcrypt";
import OtpVerification from "../models/otp.model.js";
import { sendAdminLoginOtpEmail } from "../services/emailService.js";
import { ensureConnected } from "../db/connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const reactIndexPath = path.resolve(process.cwd(), "frontend/dist/index.html");

async function loginPageController(req, res) {
  try {
    res.sendFile(reactIndexPath);
  } catch (error) {
    console.error("Error rendering login page:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function userLoginPageController(req, res) {
  try {
    res.sendFile(reactIndexPath);
  } catch (error) {
    console.error("Error rendering user login page:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function loginController(req, res) {
  try {
    const isJsonRequest = Boolean(
      req.xhr ||
      req.is("json") ||
      (req.headers.accept && req.headers.accept.includes("application/json"))
    );

    const pwd = req.body.password;
    if (!pwd) {
      if (isJsonRequest) {
        return res.status(400).json({ success: false, error: "Password is required" });
      }
      return res.status(400).send("Password is required");
    }

    const isDbReady = await ensureConnected();
    if (!isDbReady) {
      if (isJsonRequest) {
        return res.status(503).json({ success: false, error: "Database unavailable" });
      }
      return res.status(503).send("Database unavailable");
    }

    const admin = await Admin.findOne({});
    if (!admin) {
      if (isJsonRequest) {
        return res.status(500).json({ success: false, error: "Admin not configured" });
      }
      return res.status(500).send("Admin not configured");
    }

    let isMatch = false;

    if (admin.passwordHash) {
      isMatch = await bcrypt.compare(pwd, admin.passwordHash);
    }

    if (!isMatch && admin.passKey) {
      if (pwd === admin.passKey) {
        isMatch = true;
      }
    }

    if (!isMatch) {
      if (isJsonRequest) {
        return res.status(401).json({ success: false, error: "Invalid administrator credentials" });
      }
      return res.status(401).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unauthorized</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #f4f6f9; display: flex; justify-content: center; align-items: center; height: 100vh; }
    .card { background: #ffffff; padding: 40px 35px; border-radius: 10px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08); text-align: center; width: 100%; max-width: 400px; }
    .card h2 { margin-bottom: 15px; font-size: 20px; color: #c0392b; }
    .card p { font-size: 14px; color: #555; margin-bottom: 25px; }
    .btn { display: inline-block; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-size: 14px; background: #3498db; color: #ffffff; transition: background 0.2s ease; }
    .btn:hover { background: #2c80b4; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Invalid Credentials</h2>
    <p>The password you entered is incorrect.</p>
    <a href="/login" class="btn">Back to Login</a>
  </div>
</body>
</html>`);
    }

    const authorizedAdminEmail = (process.env.ADMIN_EMAIL || process.env.ADMIN_GMAIL || process.env.GMAIL_USER || 'netzeromart@gmail.com').trim().toLowerCase();

    // If OTP is supplied together with password
    if (req.body.otp) {
      const otpInput = String(req.body.otp).trim();
      const record = await OtpVerification.findOne({
        email: authorizedAdminEmail,
        purpose: 'admin_login',
        otp: otpInput
      });

      if (!record || record.expiresAt < new Date()) {
        return res.status(400).json({ success: false, error: "Invalid or expired verification code." });
      }

      await OtpVerification.deleteOne({ _id: record._id });

      const token = jwt.sign(
        {
          adminId: admin._id.toString(),
          email: authorizedAdminEmail,
          companyName: "NetZeroMart",
          userName: "netzeromart",
          pwdUpdatedAt: admin.passwordUpdatedAt ? admin.passwordUpdatedAt.getTime() : null,
          role: "admin",
        },
        process.env.JWT_SECRET,
        { expiresIn: "365d" }
      );

      res.cookie("adminToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      if (isJsonRequest) {
        return res.json({ success: true, redirectUrl: "/admin" });
      }
      return res.redirect("/admin");
    }

    // Step 1 Passed: Generate and dispatch 2FA OTP
    const otp = OtpVerification.generateCode();
    await OtpVerification.deleteMany({ email: authorizedAdminEmail, purpose: 'admin_login' });
    await OtpVerification.create({
      email: authorizedAdminEmail,
      purpose: 'admin_login',
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    await sendAdminLoginOtpEmail({ to: authorizedAdminEmail, otp });

    const maskedEmail = authorizedAdminEmail.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(Math.max(b.length, 3)) + c);

    if (isJsonRequest) {
      return res.json({
        success: true,
        requireOtp: true,
        maskedEmail,
        message: `A 6-digit verification code has been dispatched to ${maskedEmail}.`
      });
    }

    return res.redirect("/adminLogin");
  } catch (error) {
    console.error("Login error:", error);
    if (req.xhr || req.is("json") || (req.headers.accept && req.headers.accept.includes("application/json"))) {
      return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
    res.status(500).send("Internal Server Error");
  }
}

/**
 * POST /adminLogin/verify-otp & /api/adminLogin/verify-otp
 * Verifies the 6-digit OTP and establishes the authorized master admin session
 */
async function adminVerifyOtpController(req, res) {
  try {
    const isJsonRequest = Boolean(
      req.xhr ||
      req.is("json") ||
      (req.headers.accept && req.headers.accept.includes("application/json"))
    );

    const otpInput = String(req.body.otp || "").trim();
    if (!otpInput || otpInput.length < 6) {
      return res.status(400).json({ success: false, error: "Please enter the complete 6-digit verification code." });
    }

    const isDbReady = await ensureConnected();
    if (!isDbReady) {
      return res.status(503).json({ success: false, error: "Database unavailable" });
    }

    const authorizedAdminEmail = (process.env.ADMIN_EMAIL || process.env.ADMIN_GMAIL || process.env.GMAIL_USER || 'netzeromart@gmail.com').trim().toLowerCase();

    const record = await OtpVerification.findOne({
      email: authorizedAdminEmail,
      purpose: 'admin_login',
      otp: otpInput
    });

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired verification code. Please request a new code if needed."
      });
    }

    // Consume OTP
    await OtpVerification.deleteOne({ _id: record._id });

    const admin = await Admin.findOne({});
    if (!admin) {
      return res.status(500).json({ success: false, error: "Admin configuration error." });
    }

    const token = jwt.sign(
      {
        adminId: admin._id.toString(),
        email: authorizedAdminEmail,
        companyName: "NetZeroMart",
        userName: "netzeromart",
        pwdUpdatedAt: admin.passwordUpdatedAt ? admin.passwordUpdatedAt.getTime() : null,
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "365d" }
    );

    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    if (isJsonRequest) {
      return res.json({ success: true, redirectUrl: "/admin" });
    }
    return res.redirect("/admin");
  } catch (error) {
    console.error("Admin OTP verification error:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error verifying code." });
  }
}

/**
 * POST /adminLogin/resend-otp & /api/adminLogin/resend-otp
 * Dispatches a fresh 6-digit OTP to the registered administrator email
 */
async function adminResendOtpController(req, res) {
  try {
    const isDbReady = await ensureConnected();
    if (!isDbReady) {
      return res.status(503).json({ success: false, error: "Database unavailable" });
    }

    const authorizedAdminEmail = (process.env.ADMIN_EMAIL || process.env.ADMIN_GMAIL || process.env.GMAIL_USER || 'netzeromart@gmail.com').trim().toLowerCase();

    const otp = OtpVerification.generateCode();
    await OtpVerification.deleteMany({ email: authorizedAdminEmail, purpose: 'admin_login' });
    await OtpVerification.create({
      email: authorizedAdminEmail,
      purpose: 'admin_login',
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    await sendAdminLoginOtpEmail({ to: authorizedAdminEmail, otp });

    const maskedEmail = authorizedAdminEmail.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(Math.max(b.length, 3)) + c);
    return res.json({
      success: true,
      message: `A fresh 6-digit verification code has been dispatched to ${maskedEmail}.`
    });
  } catch (error) {
    console.error("Admin resend OTP error:", error);
    return res.status(500).json({ success: false, error: "Failed to resend verification code." });
  }
}

async function userLoginController(req, res) {
  try {
    const isJsonRequest = Boolean(
      req.xhr ||
      req.is("json") ||
      (req.headers.accept && req.headers.accept.includes("application/json"))
    );

    const { gmail, password } = req.body;

    if (!gmail || !password) {
      if (isJsonRequest) {
        return res.status(400).json({ success: false, error: "Email and password are required" });
      }
      return res.status(400).send("Email and password are required");
    }

    const normalizedEmail = gmail.trim().toLowerCase();
    const user = await Users.findOne({ email: normalizedEmail });

    if (!user) {
      if (isJsonRequest) {
        return res.status(401).json({ success: false, error: "Invalid email or credentials" });
      }
      return res.status(401).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unauthorized</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #f4f6f9; display: flex; justify-content: center; align-items: center; height: 100vh; }
    .card { background: #ffffff; padding: 40px 35px; border-radius: 10px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08); text-align: center; width: 100%; max-width: 400px; }
    .card h2 { margin-bottom: 15px; font-size: 20px; color: #c0392b; }
    .card p { font-size: 14px; color: #555; margin-bottom: 25px; }
    .btn { display: inline-block; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-size: 14px; background: #3498db; color: #ffffff; transition: background 0.2s ease; }
    .btn:hover { background: #2c80b4; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Invalid Credentials</h2>
    <p>The email or password you entered is incorrect.</p>
    <a href="/userLogin" class="btn">Back to Login</a>
  </div>
</body>
</html>`);
    }

    if (user.status !== "active") {
      if (isJsonRequest) {
        return res.status(403).json({ success: false, error: "Account application is pending approval or inactive." });
      }
      return res.status(403).send("Account is not active");
    }

    let isMatch = false;
    if (user.password) {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch && user.passKey) {
      if (password === user.passKey) {
        isMatch = true;
      }
    }

    if (!isMatch) {
      if (isJsonRequest) {
        return res.status(401).json({ success: false, error: "Invalid password or passkey" });
      }
      return res.status(401).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unauthorized</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #f4f6f9; display: flex; justify-content: center; align-items: center; height: 100vh; }
    .card { background: #ffffff; padding: 40px 35px; border-radius: 10px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08); text-align: center; width: 100%; max-width: 400px; }
    .card h2 { margin-bottom: 15px; font-size: 20px; color: #c0392b; }
    .card p { font-size: 14px; color: #555; margin-bottom: 25px; }
    .btn { display: inline-block; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-size: 14px; background: #3498db; color: #ffffff; transition: background 0.2s ease; }
    .btn:hover { background: #2c80b4; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Invalid Credentials</h2>
    <p>The email or password you entered is incorrect.</p>
    <a href="/userLogin" class="btn">Back to Login</a>
  </div>
</body>
</html>`);
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: "user",
        companyName: user.companyName,
        userName: user.userName,
        pwdUpdatedAt: user.passwordUpdatedAt ? user.passwordUpdatedAt.getTime() : null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "365d" }
    );

    res.cookie("userToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    if (isJsonRequest) {
      return res.json({ success: true, redirectUrl: "/userPanel" });
    }

    res.redirect("/userPanel");
  } catch (error) {
    console.error("User login error:", error);
    if (req.xhr || req.is("json") || (req.headers.accept && req.headers.accept.includes("application/json"))) {
      return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
    res.status(500).send("Internal Server Error");
  }
}

export {
  loginPageController,
  userLoginPageController,
  loginController,
  adminVerifyOtpController,
  adminResendOtpController,
  userLoginController,
};