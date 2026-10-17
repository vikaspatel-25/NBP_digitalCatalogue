import path from "path";
import { fileURLToPath } from "url";
import Admin from "../models/admin.model.js";
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resetFilePath = path.join(__dirname, "../views/pages/resetPwd.ejs");

async function resetPasswordPageController(req, res) {
  try {
    res.render(resetFilePath);
  } catch (error) {
    console.error("Error rendering reset password page:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function resetPasswordController(req, res) {
  const isJsonRequest = Boolean(
    req.xhr || req.is("json") || (req.headers.accept && req.headers.accept.includes("application/json"))
  );

  try {
    const newPwd = req.body.confirmPassword;
    if (!newPwd || newPwd.length < 6) {
      if (isJsonRequest) {
        return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });
      }
      return res.status(400).send("Password must be at least 6 characters");
    }

    const hashedPwd = await bcrypt.hash(newPwd, 12);

    await Admin.updateOne(
      {},
      {
        $set: {
          passwordHash: hashedPwd,
          passwordUpdatedAt: new Date(),
        },
      }
    );

    if (isJsonRequest) {
      return res.json({ success: true, message: "Admin password updated successfully" });
    }

    res.redirect("/admin");
  } catch (error) {
    console.error("Reset password error:", error);
    if (isJsonRequest) {
      return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
    res.status(500).send("Internal Server Error");
  }
}

export {
  resetPasswordPageController,
  resetPasswordController
};
