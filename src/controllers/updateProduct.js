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
    const requester = getRequester(req);
    if (!requester) {
      return res.redirect("/login");
    }

    const basePath = requester.role === "admin" ? "/admin" : "/userPanel";

    // Query products accessible to this user/admin
    let query = {};
    if (requester.role !== "admin") {
      query = {
        $or: [
          { creatorId: requester.id },
          { email: requester.email }
        ]
      };
    }

    const products = await Product.find(query)
      .sort({ updatedAt: -1, createdAt: -1 })
      .select("productName priceMin priceMax images order createdAt updatedAt");

    const selectedId = req.query.id;
    let selectedProduct = null;

    if (selectedId && mongoose.Types.ObjectId.isValid(selectedId)) {
      if (requester.role === "admin") {
        selectedProduct = await Product.findById(selectedId);
      } else {
        selectedProduct = await Product.findOne({
          _id: new mongoose.Types.ObjectId(selectedId),
          $or: [
            { creatorId: requester.id },
            { email: requester.email }
          ]
        });
      }
    }

    res.render(filePath, {
      products,
      selectedProduct,
      role: requester.role,
      basePath,
      error: req.query.error || null,
      success: req.query.success || null
    });
  } catch (error) {
    console.error("Error rendering Update Product page:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function updateProductController(req, res) {
  try {
    const requester = getRequester(req);
    if (!requester) {
      return res.redirect("/login");
    }

    const basePath = requester.role === "admin" ? "/admin" : "/userPanel";
    const { productId } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
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

    // Compute order placement if explicitly changed
    let orderValue = product.order;
    if (listingPlacement === "top") {
      const firstProduct = await Product.findOne().sort({ order: 1 }).select("order");
      orderValue = firstProduct ? firstProduct.order - 1 : 0;
    } else if (listingPlacement === "bottom") {
      const lastProduct = await Product.findOne().sort({ order: -1 }).select("order");
      orderValue = lastProduct ? lastProduct.order + 1 : 0;
    }

    // Normalize youtubeLinks and articleLinks arrays (strip empty strings)
    const cleanYoutubeLinks = (Array.isArray(youtubeLinks) ? youtubeLinks : [youtubeLinks])
      .map(l => l?.trim())
      .filter(Boolean);

    const cleanArticleLinks = (Array.isArray(articleLinks) ? articleLinks : [articleLinks])
      .map(l => l?.trim())
      .filter(Boolean);

    // Apply updates
    if (productName) product.productName = productName.trim();
    if (oneLineDescription !== undefined) product.oneLineDescription = oneLineDescription.trim();
    if (shortDescription) product.shortDescription = shortDescription.trim();
    if (detailedDescription) product.detailedDescription = detailedDescription.trim();
    if (priceMin !== undefined && priceMin !== "") product.priceMin = Number(priceMin);
    if (priceMax !== undefined && priceMax !== "") product.priceMax = Number(priceMax);
    if (priceNote !== undefined) product.priceNote = priceNote.trim();
    product.images = finalImages;
    product.videos = finalVideos;
    product.youtubeLinks = cleanYoutubeLinks;
    product.articleLinks = cleanArticleLinks;
    product.order = orderValue;
    product.updatedAt = new Date();

    await product.save();

    res.send(`<!DOCTYPE html>
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
      --success: #22c55e;
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
      color: #15803d;
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
    res.status(500).send("Internal Server Error");
  }
}

export { updateProductPageController, updateProductController };
