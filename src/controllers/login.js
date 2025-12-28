import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "../views/pages/login.ejs");

async function loginPageController(req, res) {
  try {
    res.render(filePath);
  } catch (error) {
    console.error("Error rendering login page:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function loginController(req, res) {
  try {
    const pwd = req.body.password;
    const admin = await Admin.findOne({});
    const isMatch = await bcrypt.compare(pwd, admin.passwordHash);

    if (!isMatch) {
      return res.status(401).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Unauthorized</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #eef2f7;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .error-box {
      background: #ffffff;
      padding: 30px 40px;
      border-radius: 6px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
      text-align: center;
      max-width: 400px;
      width: 100%;
    }
    .error-box h3 { margin-bottom: 20px; color: #c0392b; font-size: 18px; }
    .error-box a { text-decoration: none; }
    .error-box button {
      padding: 10px 18px;
      font-size: 14px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      background: #3498db;
      color: #ffffff;
    }
    .error-box button:hover { background: #2980b9; }
  </style>
</head>
<body>
  <div class="error-box">
    <h3>Invalid credentials</h3>
    <a href="/login">
      <button>Back to Login</button>
    </a>
  </div>
</body>
</html>
`);
    }

    const token = jwt.sign(
      {
        adminId: admin._id.toString(),
        pwdUpdatedAt: admin.passwordUpdatedAt.getTime(),
      },
      process.env.JWT_SECRET,
      { expiresIn: "365d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.redirect("/admin");
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Internal Server Error");
  }
}

export { loginPageController, loginController };
