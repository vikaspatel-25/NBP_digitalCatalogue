import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "../views/pages/article.ejs");
const notFoundPath = path.join(__dirname, "../views/pages/404.ejs");

async function articlePageController(req, res) {
  try {
    const id = req.query.id || req.params.id;

    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).render(notFoundPath, {
        status: 400,
        title: "Article Unavailable | NetZeroMart",
        badge: "Invalid Article ID",
        heading: "Article Unavailable",
        message: "The requested article identifier is invalid or missing. Invalid article ID provided.",
        subMessage: "Please check the URL or browse available articles and research insights.",
        actionUrl: "/home#articles",
        actionText: "Explore Articles",
        secondaryUrl: "/home",
        secondaryText: "Return to Homepage",
        type: "article"
      });
    }

    const collection = mongoose.connection.db.collection("articles");
    const article = await collection.findOne({ _id: new ObjectId(id) });

    if (!article) {
      return res.status(404).render(notFoundPath, {
        status: 404,
        title: "Article Not Found | NetZeroMart",
        badge: "Removed or Unavailable",
        heading: "Article Not Found",
        message: "This article is no longer available. It may have been permanently removed or deleted by the author.",
        subMessage: "Explore other sustainability insights, case studies, and research publications on NetZeroMart.",
        actionUrl: "/home#articles",
        actionText: "Explore Articles",
        secondaryUrl: "/home",
        secondaryText: "Return to Homepage",
        type: "article"
      });
    }

    // Verify creator subscription status (admin articles are always visible)
    if (article.creatorRole !== 'admin') {
      const { getActiveVendorIdentifiers } = await import("../services/catalogVisibility.js");
      const { emails, ids } = await getActiveVendorIdentifiers().catch(() => ({ emails: [], ids: [] }));
      const isVendorActive = (article.email && emails.includes(article.email.toLowerCase().trim())) ||
                             (article.creatorId && ids.includes(String(article.creatorId)));
      if (!isVendorActive) {
        return res.status(404).render(notFoundPath, {
          status: 404,
          title: "Article Under Renewal | NetZeroMart",
          badge: "Article Inactive",
          heading: "Article Temporarily Unavailable",
          message: "This article is currently inactive or under renewal.",
          subMessage: "The author's account is currently under renewal. Please check back later or explore other articles.",
          actionUrl: "/home#articles",
          actionText: "Explore Other Articles",
          secondaryUrl: "/home",
          secondaryText: "Return to Homepage",
          type: "article"
        });
      }
    }

    res.render(filePath, { article });

  } catch (error) {
    console.error("Error fetching article page:", error);
    res.status(500).render(notFoundPath, {
      status: 500,
      title: "Error Loading Article | NetZeroMart",
      badge: "Server Error",
      heading: "Unable to Load Article",
      message: "An unexpected error occurred while retrieving this article.",
      subMessage: "Please try again later or return to the main catalogue.",
      actionUrl: "/home",
      actionText: "Return to Homepage",
      secondaryUrl: "/home#articles",
      secondaryText: "Explore Articles",
      type: "article"
    });
  }
}

export { articlePageController };
