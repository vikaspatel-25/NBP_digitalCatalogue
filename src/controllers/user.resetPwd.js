import bcrypt from "bcrypt";
import User from "../models/user.model.js";

async function userResetPasswordController(req, res) {
  const isJsonRequest = Boolean(
    req.xhr || req.is("json") || (req.headers.accept && req.headers.accept.includes("application/json"))
  );

  try {
    const userId = req.user._id;
    const newPwd = req.body.confirmPassword;

    if (!newPwd || newPwd.length < 6) {
      if (isJsonRequest) {
        return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });
      }
      return res.status(400).send("Invalid password: must be at least 6 characters");
    }

    const hashedPwd = await bcrypt.hash(newPwd, 12);

    await User.updateOne(
      { _id: userId },
      {
        $set: {
          password: hashedPwd,
          passwordUpdatedAt: new Date(),
        },
      }
    );

    res.clearCookie("userToken");

    if (isJsonRequest) {
      return res.json({ success: true, message: "Password updated successfully! Please log in again." });
    }

    res.redirect("/userLogin");
  } catch (error) {
    console.error("User reset password error:", error);
    if (isJsonRequest) {
      return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
    res.status(500).send("Internal Server Error");
  }
}

export { userResetPasswordController };
