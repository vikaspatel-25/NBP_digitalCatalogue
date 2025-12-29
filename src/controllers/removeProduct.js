import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Product from "../models/product.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, "../views/pages/removeProduct.ejs");

async function removeProductPageController(req, res) {
  try {
    res.render(filePath);
  } catch (error) {
    res.redirect("/admin/removeProduct");
  }
}

async function removeProductController(req, res) {
  try {
    const { productId } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.redirect("/admin/removeProduct");
    }

    const deletedProduct = await Product.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(productId),
    });

    if (!deletedProduct) {
      return res.redirect("/admin/removeProduct");
    }

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Product Removed</title>
  <style>
    :root {
      --bg: #f4f6f8;
      --panel: #ffffff;
      --border: #e5e7eb;
      --text: #1f2937;
      --muted: #6b7280;
      --header-bg: #1e3a8a;
      --header-text: #ffffff;
      --danger: #dc2626;
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
      <h1>Product Removed</h1>
    </div>
    <div class="panel-body">
      <h2>Product Removed Successfully</h2>
      <p>The product has been removed from the catalogue.</p>
      <a href="/admin/removeProduct" class="btn btn-primary">Remove Another Product</a>
      <a href="/admin" class="btn btn-secondary">Back to Admin</a>
    </div>
  </div>
</body>
</html>`);
  } catch (error) {
    res.redirect("/admin/removeProduct");
  }
}

export { removeProductPageController, removeProductController };
