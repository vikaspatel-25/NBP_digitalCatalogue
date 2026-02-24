import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "../views/pages/home.ejs");

async function homePageController(req, res) {
  try {
    const db = mongoose.connection.db;

    const productsCollection = db.collection("products");
    const articlesCollection = db.collection("articles");

    const products = await productsCollection
      .find({})
      .sort({ order: 1 })
      .toArray();

    const articles = await articlesCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.render(filePath, {
      products,
      articles
    });

  } catch (error) {
    console.error("Error fetching home page data:", error);
    res.status(500).send("Internal Server Error");
  }
}

export { homePageController };