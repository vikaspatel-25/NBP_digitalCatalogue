import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js";
import Product from "../models/product.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, "../views/pages/updateProduct.ejs");

function getRequester(req) {
  const adminToken = req.cookies.adminToken;
  const userToken = req.cookies.userToken;

  try {
    if (adminToken) {
      const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
      return {
        id: decoded.adminId,
        role: "admin",
        companyName: decoded.companyName,
        userName: decoded.userName,
        email: decoded.email
      };
    }
    if (userToken) {
      const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
      return {
        id: decoded.userId,
        role: "user",
        companyName: decoded.companyName,
        userName: decoded.userName,
        email: decoded.email
      };
    }
  } catch (err) {
    console.error("Error decoding JWT for requester:", err);
  }

  return null;
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

function extractPublicId(url) {
  try {
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    let publicPath = url.substring(uploadIndex + 8);
    publicPath = publicPath.replace(/^v\d+\//, "");
    const withoutExt = publicPath.replace(/\.[^/.]+$/, "");
    return withoutExt;
  } catch {
    return null;
  }
}

async function updateProductPageController(req, res) {
  try {
    res.sendFile(path.resolve(process.cwd(), "frontend/dist/index.html"));
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
}

async function updateProductController(req, res) {
  const isJsonRequest = Boolean(
    req.xhr ||
    req.is("json") ||
    (req.headers.accept && req.headers.accept.includes("application/json")) ||
    (req.originalUrl && req.originalUrl.startsWith("/api/"))
  );

  try {
    const requester = getRequester(req);
    if (!requester) {
      if (isJsonRequest) {
        return res.status(401).json({ success: false, error: "Unauthorized session. Please sign in." });
      }
      return res.redirect("/login");
    }

    const basePath = requester.role === "admin" ? "/admin" : "/userPanel";
    const productId = req.body.productId || req.query.id;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      if (isJsonRequest) {
        return res.status(400).json({ success: false, error: "Invalid product ID" });
      }
      return res.redirect(`${basePath}/updateProduct?error=Invalid%20product%20ID`);
    }

    let product;
    if (requester.role === "admin") {
      product = await Product.findById(productId);
    } else {
      product = await Product.findOne({
        _id: new mongoose.Types.ObjectId(productId),
        $or: [
          { creatorId: requester.id },
          { email: requester.email }
        ]
      });
    }

    if (!product) {
      if (isJsonRequest) {
        return res.status(403).json({ success: false, error: "You are not authorized to update this product, or it does not exist." });
      }
      return res.status(403).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Update Not Allowed</title>
  <style>
    body { margin: 0; min-height: 100vh; background: #f4f6f8; font-family: system-ui, -apple-system, sans-serif; display: flex; justify-content: center; align-items: flex-start; padding: 8vh 1rem; }
    .panel { max-width: 560px; width: 100%; background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 12px 30px rgba(0,0,0,0.08); }
    .header { background: #1e3a8a; color: #fff; padding: 1.7rem 2.2rem; }
    .header h1 { margin: 0; font-size: 1.35rem; }
    .body { padding: 2rem 2.2rem; }
    .btn { display: inline-block; padding: 0.6rem 1.2rem; border-radius: 8px; text-decoration: none; font-size: 0.85rem; font-weight: 500; background: #dc2626; color: #fff; }
    .btn-secondary { background: #e5e7eb; color: #1f2937; margin-left: 0.5rem; }
  </style>
</head>
<body>
  <div class="panel">
    <div class="header"><h1>Update Not Allowed</h1></div>
    <div class="body">
      <h2>Action Denied</h2>
      <p>You are not authorized to update this product, or it does not exist.</p>
      <a href="${basePath}/updateProduct" class="btn">Select Another Product</a>
      <a href="${basePath}" class="btn btn-secondary">Back to Panel</a>
    </div>
  </div>
</body>
</html>`);
    }

    const {
      productName,
      oneLineDescription,
      shortDescription,
      detailedDescription,
      listingPlacement,
      priceMin,
      priceMax,
      priceNote,
      existingImages,
      existingVideos,
      youtubeLinks = [],
      articleLinks = []
    } = req.body;

    // Handle existing images preserved by user
    let preservedImages = [];
    if (existingImages) {
      preservedImages = Array.isArray(existingImages) ? existingImages : [existingImages];
    }

    // Identify images that were removed and delete them from Cloudinary
    const oldImages = product.images || [];
    const removedImages = oldImages.filter(img => !preservedImages.includes(img));
    for (const imgUrl of removedImages) {
      const publicId = extractPublicId(imgUrl);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
        } catch (cErr) {
          console.error("Error removing old image from Cloudinary:", cErr);
        }
      }
    }

    // Upload newly added images
    const newImageFiles = (req.files && req.files.images) || [];
    const uploadedImages = [];
    for (const image of newImageFiles) {
      const result = await uploadToCloudinary(image.buffer, "image");
      uploadedImages.push(result.secure_url);
    }

    const finalImages = [...preservedImages, ...uploadedImages];
    if (finalImages.length === 0) {
      if (isJsonRequest) {
        return res.status(400).json({ success: false, error: "At least one product image is required." });
      }
      return res.redirect(`${basePath}/updateProduct?id=${productId}&error=At%20least%20one%20image%20is%20required`);
    }

    // Handle existing videos preserved
    let preservedVideos = [];
    if (existingVideos) {
      preservedVideos = Array.isArray(existingVideos) ? existingVideos : [existingVideos];
    }

    const oldVideos = product.videos || [];
    const removedVideos = oldVideos.filter(vid => !preservedVideos.includes(vid));
    for (const vidUrl of removedVideos) {
      const publicId = extractPublicId(vidUrl);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
        } catch (cErr) {
          console.error("Error removing old video from Cloudinary:", cErr);
        }
      }
    }

    const newVideoFiles = (req.files && req.files.videos) || [];
    const uploadedVideos = [];
    for (const video of newVideoFiles) {
      const result = await uploadToCloudinary(video.buffer, "video");
      uploadedVideos.push(result.secure_url);
    }

    const finalVideos = [...preservedVideos, ...uploadedVideos];

    // Ensure links are stored as arrays
    let finalYoutube = [];
    if (youtubeLinks) {
      finalYoutube = Array.isArray(youtubeLinks) ? youtubeLinks.filter(Boolean) : [youtubeLinks].filter(Boolean);
    }

    let finalArticles = [];
    if (articleLinks) {
      finalArticles = Array.isArray(articleLinks) ? articleLinks.filter(Boolean) : [articleLinks].filter(Boolean);
    }

    // Handle listing placement repositioning if changed
    if (listingPlacement === "top") {
      const newestProduct = await Product.findOne({}, { createdAt: 1 }).sort({ createdAt: -1 });
      if (newestProduct && newestProduct.createdAt) {
        product.createdAt = new Date(newestProduct.createdAt.getTime() + 1000);
      } else {
        product.createdAt = new Date();
      }
    } else if (listingPlacement === "bottom") {
      const oldestProduct = await Product.findOne({}, { createdAt: 1 }).sort({ createdAt: 1 });
      if (oldestProduct && oldestProduct.createdAt) {
        product.createdAt = new Date(oldestProduct.createdAt.getTime() - 1000);
      } else {
        product.createdAt = new Date(Date.now() - 10000000);
      }
    }

    // Apply updated fields
    if (productName) product.productName = productName;
    if (oneLineDescription !== undefined) product.oneLineDescription = oneLineDescription;
    if (shortDescription !== undefined) product.shortDescription = shortDescription;
    if (detailedDescription !== undefined) product.detailedDescription = detailedDescription;
    if (priceMin !== undefined) product.priceMin = priceMin;
    if (priceMax !== undefined) product.priceMax = priceMax;
    if (priceNote !== undefined) product.priceNote = priceNote;

    product.images = finalImages;
    product.videos = finalVideos;
    product.youtubeLinks = finalYoutube;
    product.articleLinks = finalArticles;

    // Preserve critical ownership metadata
    if (!product.creatorId) product.creatorId = requester.id;
    if (!product.creatorRole) product.creatorRole = requester.role;
    if (!product.userName) product.userName = requester.userName || (requester.role === "admin" ? "netzeromart" : "User");
    if (!product.companyName) product.companyName = requester.companyName || (requester.role === "admin" ? "NetZeroMart" : "Company");
    if (!product.email) product.email = requester.email || (requester.role === "admin" ? "netzeromart@gmail.com" : "user@netzeromart.com");

    await product.save();

    if (isJsonRequest) {
      return res.json({
        success: true,
        message: `Product "${product.productName}" updated successfully`,
        product
      });
    }

    return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Product Updated</title>
  <style>
    :root {
      --bg: #f4f6f8;
      --panel: #ffffff;
      --border: #e5e7eb;
      --text: #1f2937;
      --muted: #6b7280;
      --header-bg: #1e3a8a;
      --header-text: #ffffff;
      --primary: #2563eb;
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
      line-height: 1.5;
    }
    .btn {
      display: inline-block;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
      margin-right: 0.6rem;
      margin-bottom: 0.5rem;
    }
    .btn-primary {
      background: #2563eb;
      color: #ffffff;
    }
    .btn-secondary {
      background: #e5e7eb;
      color: var(--text);
    }
    .btn-view {
      background: #10b981;
      color: #ffffff;
    }
  </style>
</head>
<body>
  <div class="panel">
    <div class="panel-header">
      <h1>Product Updated</h1>
    </div>
    <div class="panel-body">
      <h2>Changes Saved Successfully</h2>
      <p>The product <strong>${product.productName}</strong> has been updated in the catalogue.</p>
      <a href="/home/product?id=${product._id}" class="btn btn-view" target="_blank">View Live Product</a>
      <a href="${basePath}/updateProduct?id=${product._id}" class="btn btn-primary">Edit Again</a>
      <a href="${basePath}/updateProduct" class="btn btn-secondary">Select Another</a>
      <a href="${basePath}" class="btn btn-secondary">Back to Panel</a>
    </div>
  </div>
</body>
</html>`);
  } catch (error) {
    console.error("Error updating product:", error);
    if (isJsonRequest) {
      return res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
    }
    res.status(500).send("Internal Server Error");
  }
}

export { updateProductPageController, updateProductController };

export async function apiUpdateProductPageController(req, res) {
  try {
    const { id } = req.query;
    if (id) {
      const product = await Product.findById(id);
      if (product) return res.json({ success: true, product });
    }
    const requester = getRequester(req);
    const filter = requester && requester.role === "admin" ? {} : { creatorId: requester.id };
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

export async function apiUpdateProductController(req, res) {
  return updateProductController(req, res);
}
