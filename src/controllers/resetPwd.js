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
  try {
    const newPwd = req.body.confirmPassword;
    if (!newPwd) return res.status(400).send("Password is required");

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

    res.redirect("/admin");
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).send("Internal Server Error");
  }
}

export {
  resetPasswordPageController,
  resetPasswordController
};
