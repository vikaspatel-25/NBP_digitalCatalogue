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

    // Verify creator subscription status (admin products are always visible)
    if (product.creatorRole !== 'admin') {
      const { getActiveVendorIdentifiers } = await import("../services/catalogVisibility.js");
      const { emails, ids } = await getActiveVendorIdentifiers().catch(() => ({ emails: [], ids: [] }));
      const isVendorActive = (product.email && emails.includes(product.email.toLowerCase().trim())) ||
                             (product.creatorId && ids.includes(String(product.creatorId)));
      if (!isVendorActive) {
        return res.status(404).send("This product listing is currently inactive or under renewal.");
      }
    }

    res.render(filePath, { product });

  } catch (error) {
    console.error("Error fetching product page:", error);
    res.status(500).send("Internal Server Error");
  }
}

export { productPageController };
