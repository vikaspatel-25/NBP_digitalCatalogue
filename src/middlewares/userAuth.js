import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export async function userAuth(req, res, next) {
  try {
    const token = req.cookies.userToken;
    if (!token) return res.redirect("/userLogin");

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload.userId) {
      res.clearCookie("userToken");
      return res.redirect("/userLogin");
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      res.clearCookie("userToken");
      return res.redirect("/userLogin");
    }

    if (user.status !== "active") {
      res.clearCookie("userToken");
      return res.redirect("/userLogin");
    }

    const currentPwdUpdatedAt = user.passwordUpdatedAt
      ? user.passwordUpdatedAt.getTime()
      : null;

    if (currentPwdUpdatedAt !== payload.pwdUpdatedAt) {
      res.clearCookie("userToken");
      return res.redirect("/userLogin");
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("User auth middleware error:", err);
    res.clearCookie("userToken");
    res.redirect("/userLogin");
  }
}

export default userAuth;
