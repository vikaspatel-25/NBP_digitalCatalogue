import bcrypt from "bcrypt";
import User from "../models/user.model.js";

async function userResetPasswordController(req, res) {
  try {
    const userId = req.user._id;
    const newPwd = req.body.confirmPassword;

    if (!newPwd || newPwd.length < 4) {
      return res.status(400).send("Invalid password");
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

    res.redirect("/userLogin");
  } catch (error) {
    console.error("User reset password error:", error);
    res.status(500).send("Internal Server Error");
  }
}

export { userResetPasswordController };
