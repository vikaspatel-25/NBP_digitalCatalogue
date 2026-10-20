import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "../views/pages/product.ejs");
const notFoundPath = path.join(__dirname, "../views/pages/404.ejs");

async function productPageController(req, res) {
  try {
    const id = req.query.id || req.params.id;

    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).render(notFoundPath, {
        status: 400,
        title: "Product Unavailable | NetZeroMart",
        badge: "Invalid Product ID",
        heading: "Product Unavailable",
        message: "The requested product identifier is invalid or missing. Invalid product ID provided.",
        subMessage: "Please verify the link or search for sustainable products in the catalogue.",
        actionUrl: "/home#products",
        actionText: "Browse All Products",
        secondaryUrl: "/home",
        secondaryText: "Return to Homepage",
        type: "product"
      });
    }

    const collection = mongoose.connection.db.collection("products");
    const product = await collection.findOne({ _id: new ObjectId(id) });

    if (!product) {
      return res.status(404).render(notFoundPath, {
        status: 404,
        title: "Product Not Found | NetZeroMart",
        badge: "Removed or Unavailable",
        heading: "Product Not Found",
        message: "This product is no longer available in the catalogue. It may have been permanently removed or deleted by the vendor.",
        subMessage: "Browse our directory to discover other verified sustainable products and clean technologies.",
        actionUrl: "/home#products",
        actionText: "Browse All Products",
        secondaryUrl: "/home",
        secondaryText: "Return to Homepage",
        type: "product"
      });
    }

    // Verify creator subscription status (admin products are always visible)
    if (product.creatorRole !== 'admin') {
      const { getActiveVendorIdentifiers } = await import("../services/catalogVisibility.js");
      const { emails, ids } = await getActiveVendorIdentifiers().catch(() => ({ emails: [], ids: [] }));
      const isVendorActive = (product.email && emails.includes(product.email.toLowerCase().trim())) ||
                             (product.creatorId && ids.includes(String(product.creatorId)));
      if (!isVendorActive) {
        return res.status(404).render(notFoundPath, {
          status: 404,
          title: "Listing Under Renewal | NetZeroMart",
          badge: "Listing Inactive",
          heading: "Listing Temporarily Unavailable",
          message: "This product listing is currently inactive or under renewal.",
          subMessage: "The vendor's catalogue subscription is currently under renewal or review. Please check back soon.",
          actionUrl: "/home#products",
          actionText: "Browse Other Products",
          secondaryUrl: "/home",
          secondaryText: "Return to Homepage",
          type: "product"
        });
      }
    }

    res.render(filePath, { product });

  } catch (error) {
    console.error("Error fetching product page:", error);
    res.status(500).render(notFoundPath, {
      status: 500,
      title: "Error Loading Product | NetZeroMart",
      badge: "Server Error",
      heading: "Unable to Load Product",
      message: "An unexpected error occurred while retrieving this product.",
      subMessage: "Please try again later or return to the main catalogue.",
      actionUrl: "/home",
      actionText: "Return to Homepage",
      secondaryUrl: "/home#products",
      secondaryText: "Browse Products",
      type: "product"
    });
  }
}

export { productPageController };
