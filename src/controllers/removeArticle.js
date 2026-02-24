import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Article from "../models/article.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, "../views/pages/removeArticle.ejs");

async function removeArticlePageController(req, res) {
  try {
    res.render(filePath);
  } catch (error) {
    res.redirect("/admin/removeArticle");
  }
}

function getRequester(req) {
  const adminToken = req.cookies.adminToken;
  const userToken = req.cookies.userToken;

  try {
    if (adminToken) {
      const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
      return { id: decoded.adminId, role: "admin" };
    }

    if (userToken) {
      const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
      return { id: decoded.userId, role: "user" };
    }
  } catch (err) {
    console.error("Error decoding JWT:", err);
  }

  return null;
}

async function removeArticleController(req, res) {
  try {
    const { articleId } = req.body;

    if (!articleId || !mongoose.Types.ObjectId.isValid(articleId)) {
      return res.redirect("/admin/removeArticle");
    }

    const requester = getRequester(req);

    if (!requester) {
      return res.redirect("/admin/removeArticle");
    }

    let article;

    if (requester.role === "admin") {
      article = await Article.findOne({
        _id: new mongoose.Types.ObjectId(articleId),
      });
    } else {
      article = await Article.findOne({
        _id: new mongoose.Types.ObjectId(articleId),
        creatorId: requester.id,
      });
    }

    const removeAnotherLink =
      requester.role === "admin"
        ? "/admin/removeArticle"
        : "/userPanel/removeArticle";

    const backLink =
      requester.role === "admin"
        ? "/admin"
        : "/userPanel";

    if (!article) {
      return res.status(403).send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Removal Not Allowed</title>

<style>

:root{
--bg:#f4f6f8;
--panel:#ffffff;
--border:#e5e7eb;
--text:#1f2937;
--muted:#6b7280;
--header-bg:#1e3a8a;
--header-text:#ffffff;
--danger:#dc2626;
}

*{box-sizing:border-box;}

body{
margin:0;
min-height:100vh;
background:var(--bg);
font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
color:var(--text);
display:flex;
justify-content:center;
align-items:flex-start;
padding:8vh 1rem;
}

.panel{
width:100%;
max-width:560px;
background:var(--panel);
border-radius:14px;
overflow:hidden;
box-shadow:0 12px 30px rgba(0,0,0,0.08),0 4px 10px rgba(0,0,0,0.05);
}

.panel-header{
padding:1.7rem 2.2rem;
background:var(--header-bg);
color:var(--header-text);
}

.panel-header h1{
margin:0;
font-size:1.35rem;
font-weight:600;
}

.panel-body{
padding:2rem 2.2rem;
}

.panel-body h2{
margin-top:0;
font-size:1.1rem;
font-weight:600;
}

.panel-body p{
font-size:0.9rem;
color:var(--muted);
margin-bottom:1.5rem;
}

.btn{
display:inline-block;
padding:0.6rem 1.2rem;
border-radius:8px;
text-decoration:none;
font-size:0.85rem;
font-weight:500;
margin-right:0.6rem;
}

.btn-primary{
background:var(--danger);
color:#ffffff;
}

.btn-secondary{
background:#e5e7eb;
color:var(--text);
}

</style>
</head>

<body>

<div class="panel">

<div class="panel-header">
<h1>Removal Not Allowed</h1>
</div>

<div class="panel-body">

<h2>Action Denied</h2>

<p>You are not authorized to remove this article, or it does not exist.</p>

<a href="${removeAnotherLink}" class="btn btn-primary">
Remove Another Article
</a>

<a href="${backLink}" class="btn btn-secondary">
Back
</a>

</div>
</div>

</body>
</html>`);
    }

    await article.deleteOne();

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>

<meta charset="UTF-8" />
<title>Article Removed</title>

<style>

:root{
--bg:#f4f6f8;
--panel:#ffffff;
--border:#e5e7eb;
--text:#1f2937;
--muted:#6b7280;
--header-bg:#1e3a8a;
--header-text:#ffffff;
--danger:#dc2626;
}

*{box-sizing:border-box;}

body{
margin:0;
min-height:100vh;
background:var(--bg);
font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
color:var(--text);
display:flex;
justify-content:center;
align-items:flex-start;
padding:8vh 1rem;
}

.panel{
width:100%;
max-width:560px;
background:var(--panel);
border-radius:14px;
overflow:hidden;
box-shadow:0 12px 30px rgba(0,0,0,0.08),0 4px 10px rgba(0,0,0,0.05);
}

.panel-header{
padding:1.7rem 2.2rem;
background:var(--header-bg);
color:var(--header-text);
}

.panel-header h1{
margin:0;
font-size:1.35rem;
font-weight:600;
}

.panel-body{
padding:2rem 2.2rem;
}

.panel-body h2{
margin-top:0;
font-size:1.1rem;
font-weight:600;
}

.panel-body p{
font-size:0.9rem;
color:var(--muted);
margin-bottom:1.5rem;
}

.btn{
display:inline-block;
padding:0.6rem 1.2rem;
border-radius:8px;
text-decoration:none;
font-size:0.85rem;
font-weight:500;
margin-right:0.6rem;
}

.btn-primary{
background:var(--danger);
color:#ffffff;
}

.btn-secondary{
background:#e5e7eb;
color:var(--text);
}

</style>

</head>

<body>

<div class="panel">

<div class="panel-header">
<h1>Article Removed</h1>
</div>

<div class="panel-body">

<h2>Article Removed Successfully</h2>

<p>The article has been removed from the database.</p>

<a href="${removeAnotherLink}" class="btn btn-primary">
Remove Another Article
</a>

<a href="${backLink}" class="btn btn-secondary">
Back
</a>

</div>
</div>

</body>
</html>`);
  } catch (error) {
    console.error("Error removing article:", error);
    res.redirect("/admin/removeArticle");
  }
}

export {
removeArticlePageController,
removeArticleController
};