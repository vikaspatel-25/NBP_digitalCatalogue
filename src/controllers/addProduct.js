import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "../config/cloudinary.js";
import Product from "../models/product.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, "../views/pages/addProduct.ejs");

async function addProductPageController(req, res) {
  try {
    res.render(filePath);
  } catch (error) {
    console.error("Error rendering Add Product page:", error);
    res.status(500).send("Internal Server Error");
  }
}

function uploadToCloudinary(buffer, type = "image") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: type },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

async function addProductController(req, res) {
  try {
    const {
      productName,
      oneLineDescription,
      shortDescription,
      detailedDescription,
      listingPlacement,
      youtubeLinks = [],
      articleLinks = [],
    } = req.body;

    const images = req.files.images || [];
    const videos = req.files.videos || [];

    if (!productName || !shortDescription || !detailedDescription) {
      return res.status(400).send("Required fields missing");
    }

    if (images.length === 0) {
      return res.status(400).send("At least one image required");
    }

    const uploadedImages = [];
    for (const image of images) {
      const result = await uploadToCloudinary(image.buffer, "image");
      uploadedImages.push(result.secure_url);
    }

    const uploadedVideos = [];
    for (const video of videos) {
      const result = await uploadToCloudinary(video.buffer, "video");
      uploadedVideos.push(result.secure_url);
    }

    let orderValue;
    if (listingPlacement === "top") {
      const firstProduct = await Product.findOne().sort({ order: 1 }).select("order");
      orderValue = firstProduct ? firstProduct.order - 1 : 0;
    } else {
      const lastProduct = await Product.findOne().sort({ order: -1 }).select("order");
      orderValue = lastProduct ? lastProduct.order + 1 : 0;
    }

    const productData = {
      productName,
      oneLineDescription,
      shortDescription,
      detailedDescription,
      images: uploadedImages,
      videos: uploadedVideos,
      youtubeLinks: Array.isArray(youtubeLinks) ? youtubeLinks : [youtubeLinks],
      articleLinks: Array.isArray(articleLinks) ? articleLinks : [articleLinks],
      order: orderValue,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await Product.create(productData);

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Product Added</title>
  <style>/* same styles as before */</style>
</head>
<body>
  <div class="panel">
    <div class="panel-header">
      <h1>Product Added</h1>
    </div>
    <div class="panel-body">
      <h2>Product Added Successfully</h2>
      <p>The product has been saved to the catalogue.</p>
      <a href="/admin/addProduct" class="btn btn-primary">Add Another Product</a>
      <a href="/admin" class="btn btn-secondary">Back to Admin</a>
    </div>
  </div>
</body>
</html>`);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).send("Internal Server Error");
  }
}

export { addProductPageController, addProductController };
