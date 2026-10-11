import User from '../models/user.model.js';
import ApprovedUser from '../models/approved.user.model.js';

/**
 * Returns an array of user emails and IDs that have an active subscription or trial
 */
export async function getActiveVendorIdentifiers() {
  const now = new Date();

  // Find all vendors whose subscription expiresAt is in the future
  const [approvedActive, usersActive] = await Promise.all([
    ApprovedUser.find(
      {
        $or: [
          { 'subscription.expiresAt': { $gt: now } },
          // If no subscription recorded yet (e.g. legacy before migration), allow or treat as trial
          { subscription: { $exists: false } }
        ]
      },
      { email: 1, userId: 1, _id: 1 }
    ).lean(),
    User.find(
      {
        $or: [
          { 'subscription.expiresAt': { $gt: now } },
          { subscription: { $exists: false } }
        ]
      },
      { email: 1, userId: 1, _id: 1 }
    ).lean()
  ]);

  const activeEmails = new Set();
  const activeIds = new Set();

  [...approvedActive, ...usersActive].forEach(v => {
    if (v.email) activeEmails.add(v.email.toLowerCase().trim());
    if (v.userId) activeIds.add(String(v.userId));
    if (v._id) activeIds.add(String(v._id));
  });

  return {
    emails: Array.from(activeEmails),
    ids: Array.from(activeIds)
  };
}

/**
 * Builds a MongoDB filter query for products/articles so only items from active vendors
 * (or admin-created items) are returned.
 */
export async function buildActiveCatalogFilter() {
  const { emails, ids } = await getActiveVendorIdentifiers();

  return {
    $or: [
      // 1. All Admin products/articles are always visible
      { creatorRole: 'admin' },
      { email: (process.env.ADMIN_GMAIL || 'netzeromart@gmail.com').toLowerCase().trim() },
      // 2. Vendor items where the creator has an active subscription/trial
      { email: { $in: emails } },
      { creatorId: { $in: ids } }
    ]
  };
}
