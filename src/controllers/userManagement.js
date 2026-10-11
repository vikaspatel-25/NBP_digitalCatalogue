import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import User from "../models/approved.user.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const reactIndexPath = path.resolve(process.cwd(), "frontend/dist/index.html");

async function userManagementPageController(req, res) {
  try {
    res.sendFile(reactIndexPath);
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
    const rawUsers = await User.find({}).lean();
    const now = new Date();

    let subscribedCount = 0;
    let trialCount = 0;
    let expiredCount = 0;

    const users = rawUsers.map(user => {
      const sub = user.subscription || {};
      const expiresAt = sub.expiresAt ? new Date(sub.expiresAt) : null;
      const isExpired = !expiresAt || expiresAt <= now;
      const remainingDays = expiresAt && !isExpired
        ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      let computedStatus = 'expired';
      if (!isExpired) {
        if (sub.status === 'active' && sub.plan !== 'free_trial') {
          computedStatus = 'active';
          subscribedCount++;
        } else {
          computedStatus = 'trial';
          trialCount++;
        }
      } else {
        expiredCount++;
      }

      return {
        ...user,
        subscription: {
          ...sub,
          computedStatus,
          remainingDays,
          isExpired
        }
      };
    });

    res.json({
      success: true,
      users,
      stats: {
        totalVendors: users.length,
        subscribed: subscribedCount,
        trial: trialCount,
        expired: expiredCount
      }
    });
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
