import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "../views/pages/product.ejs");

async function productPageController(req, res) {
  try {
    const id = req.query.id;

    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).send("Invalid product ID");
    }

    const collection = mongoose.connection.db.collection("products");
    const product = await collection.findOne({ _id: new ObjectId(id) });

    if (!product) {
      return res.status(404).send("Product not found");
    }

    res.render(filePath, { product });

  } catch (error) {
    console.error("Error fetching product page:", error);
    res.status(500).send("Internal Server Error");
  }
}

export { productPageController };
