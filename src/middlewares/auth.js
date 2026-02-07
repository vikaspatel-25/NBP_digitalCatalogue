import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";

export async function auth(req, res, next) {
  try {
    const token = req.cookies.adminToken;
    if (!token) return res.redirect("/login");

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload.adminId) {
      res.clearCookie("adminToken");
      return res.redirect("/login");
    }

    const admin = await Admin.findOne({});
    if (!admin) {
      res.clearCookie("adminToken");
      return res.redirect("/login");
    }

    const currentPwdUpdatedAt = admin.passwordUpdatedAt
      ? admin.passwordUpdatedAt.getTime()
      : null;

    if (currentPwdUpdatedAt !== payload.pwdUpdatedAt) {
      res.clearCookie("adminToken");
      return res.redirect("/login");
    }

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.clearCookie("adminToken");
    res.redirect("/login");
  }
}

export default auth;
