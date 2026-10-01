import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import User from "../models/approved.user.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "../views/pages/userManagement.ejs");

async function userManagementPageController(req, res) {
  try {
    const users = await User.find({});
    res.render(filePath, { users });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
}

async function removeUserController(req, res) {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    if (user.document && user.document.public_id) {
      await cloudinary.uploader.destroy(user.document.public_id);
    }

    await User.findByIdAndDelete(userId);

    res.redirect("/admin/userManagement");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
}

export { userManagementPageController, removeUserController };

export async function apiUserManagementPageController(req, res) {
  try {
    const users = await User.find({});
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

export async function apiRemoveUserController(req, res) {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.document && user.document.public_id) {
      await cloudinary.uploader.destroy(user.document.public_id);
    }

    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
