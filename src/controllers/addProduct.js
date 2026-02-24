import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "../config/cloudinary.js";
import Product from "../models/product.model.js";
import jwt from "jsonwebtoken";

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

function getCreatorId(req) {
  const adminToken = req.cookies.adminToken;
  const userToken = req.cookies.userToken;

  try {
    if (adminToken) {
      const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
      return { id: decoded.adminId, role: "admin", companyName: decoded.companyName };
    }
    if (userToken) {
      const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
      return { id: decoded.userId, role: "user", companyName: decoded.companyName };
    }
  } catch (err) {
    console.error("Error decoding JWT for creator ID:", err);
  }

  return null;
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
      priceMin,
      priceMax,
      priceNote
    } = req.body;
    const images = req.files.images || [];
    const videos = req.files.videos || [];

    if (!productName || !shortDescription || !detailedDescription) {
      return res.status(400).send("Required fields missing");
    }

    if (images.length === 0) {
      return res.status(400).send("At least one image required");
    }

    if (!priceMin || !priceMax) {
      return res.status(400).send("Price range required");
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

    const creator = getCreatorId(req);

    const productData = {
      productName,
      oneLineDescription,
      shortDescription,
      detailedDescription,
      priceMin,
      priceMax,
      priceNote,
      images: uploadedImages,
      videos: uploadedVideos,
      youtubeLinks: Array.isArray(youtubeLinks) ? youtubeLinks : [youtubeLinks],
      articleLinks: Array.isArray(articleLinks) ? articleLinks : [articleLinks],
      order: orderValue,
      createdAt: new Date(),
      updatedAt: new Date(),
      creatorId: creator ? creator.id : null,
      companyName: creator ? creator.companyName : null,
      creatorRole: creator ? creator.role : null,
    };

    await Product.create(productData);

    const addAnotherLink =
      creator && creator.role === "admin"
        ? "/admin/addProduct"
        : "/userPanel/addProduct";

    const backLink =
      creator && creator.role === "admin"
        ? "/admin"
        : "/userPanel";

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Product Added</title>
  <style>
    :root {
      --bg: #f4f6f8;
      --panel: #ffffff;
      --border: #e5e7eb;
      --text: #1f2937;
      --muted: #6b7280;
      --header-bg: #1e3a8a;
      --header-text: #ffffff;
      --danger: #06d106ff;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      background: var(--bg);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--text);
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 8vh 1rem;
    }

    .panel {
      width: 100%;
      max-width: 560px;
      background: var(--panel);
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 12px 30px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.05);
    }

    .panel-header {
      padding: 1.7rem 2.2rem;
      background: var(--header-bg);
      color: var(--header-text);
    }

    .panel-header h1 {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 600;
    }

    .panel-body {
      padding: 2rem 2.2rem;
    }

    .panel-body h2 {
      margin-top: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .panel-body p {
      font-size: 0.9rem;
      color: var(--muted);
      margin-bottom: 1.5rem;
    }

    .btn {
      display: inline-block;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
      margin-right: 0.6rem;
    }

    .btn-primary {
      background: var(--danger);
      color: #ffffff;
    }

    .btn-secondary {
      background: #e5e7eb;
      color: var(--text);
    }
  </style>
</head>
<body>
  <div class="panel">
    <div class="panel-header">
      <h1>Product Added</h1>
    </div>
    <div class="panel-body">
      <h2>Product Added Successfully</h2>
      <p>The product has been saved to the catalogue.</p>
      <a href="${addAnotherLink}" class="btn btn-primary">Add Another Product</a>
      <a href="${backLink}" class="btn btn-secondary">Back</a>
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