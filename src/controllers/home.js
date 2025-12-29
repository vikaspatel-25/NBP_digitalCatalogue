import path from "path";
import { fileURLToPath } from "url";
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "../views/pages/home.ejs?v=2");

async function homePageController(req, res) {
  try {
    const collection = mongoose.connection.db.collection('products');

    const products = await collection
      .find({})
      .sort({ order: 1 })
      .toArray();

    res.render(filePath, { products });
  } catch (error) {
    console.error("Error fetching home page products:", error);
    res.status(500).send("Internal Server Error");
  }
}

export { homePageController };
