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

import { sendExpirationReminderEmail } from "../services/emailService.js";

export async function apiUserManagementPageController(req, res) {
  try {
    const rawUsers = await User.find({}).lean();
    const now = new Date();

    let activeCount = 0;
    let expiringCount = 0;
    let pendingPaymentCount = 0;
    let expiredCount = 0;

    const users = rawUsers.map(user => {
      const sub = user.subscription || {};
      const expiresAt = sub.expiresAt ? new Date(sub.expiresAt) : null;
      const isExpired = !expiresAt || expiresAt <= now;
      const remainingDays = expiresAt && !isExpired
        ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      let computedStatus = 'pending_payment';
      if (sub.status === 'active' && !isExpired) {
        computedStatus = 'active';
        activeCount++;
        if (remainingDays <= 30) {
          expiringCount++;
        }
      } else if (sub.status === 'pending_payment' || !expiresAt) {
        computedStatus = 'pending_payment';
        pendingPaymentCount++;
      } else if (isExpired) {
        computedStatus = 'expired';
        expiredCount++;
      }

      return {
        ...user,
        subscription: {
          ...sub,
          computedStatus,
          remainingDays,
          isExpired,
          isExpiringSoon: computedStatus === 'active' && remainingDays <= 30
        }
      };
    });

    res.json({
      success: true,
      users,
      stats: {
        totalVendors: users.length,
        active: activeCount,
        expiringSoon: expiringCount,
        pendingPayment: pendingPaymentCount,
        expired: expiredCount,
        // legacy compatibility
        subscribed: activeCount,
        trial: pendingPaymentCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

export async function apiSendReminderController(req, res) {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const sub = user.subscription || {};
    const now = new Date();
    const expiresAt = sub.expiresAt ? new Date(sub.expiresAt) : null;
    const remainingDays = expiresAt && expiresAt > now
      ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    await sendExpirationReminderEmail({
      to: user.email,
      companyName: user.companyName,
      userName: user.userName,
      expiresAt: sub.expiresAt || new Date(),
      daysRemaining: remainingDays,
      plan: sub.plan || 'yearly_1200'
    });

    return res.json({ success: true, message: `Reminder email successfully sent to ${user.email}` });
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Failed to send reminder' });
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
