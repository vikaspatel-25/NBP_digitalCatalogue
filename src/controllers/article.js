import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "../views/pages/article.ejs");

async function articlePageController(req, res) {
  try {
    const id = req.query.id;

    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).send("Invalid article ID");
    }

    const collection = mongoose.connection.db.collection("articles");
    const article = await collection.findOne({ _id: new ObjectId(id) });

    if (!article) {
      return res.status(404).send("Article not found");
    }

    // Verify creator subscription status (admin articles are always visible)
    if (article.creatorRole !== 'admin') {
      const { getActiveVendorIdentifiers } = await import("../services/catalogVisibility.js");
      const { emails, ids } = await getActiveVendorIdentifiers().catch(() => ({ emails: [], ids: [] }));
      const isVendorActive = (article.email && emails.includes(article.email.toLowerCase().trim())) ||
                             (article.creatorId && ids.includes(String(article.creatorId)));
      if (!isVendorActive) {
        return res.status(404).send("This article is currently inactive or under renewal.");
      }
    }

    res.render(filePath, { article });

  } catch (error) {
    console.error("Error fetching article page:", error);
    res.status(500).send("Internal Server Error");
  }
}

export { articlePageController };