import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "../config/cloudinary.js";
import Article from "../models/article.model.js";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "../views/pages/addArticle.ejs");


async function addArticlePageController(req, res) {
  try {
    res.render(filePath);
  } catch (error) {
    console.error("Error rendering Add Article page:", error);
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

      return {
        id: decoded.adminId,
        role: "admin",
        companyName: decoded.companyName,
      };
    }

    if (userToken) {

      const decoded = jwt.verify(userToken, process.env.JWT_SECRET);

      return {
        id: decoded.userId,
        role: "user",
        companyName: decoded.companyName,
      };
    }

  } catch (err) {

    console.error("Error decoding JWT:", err);
  }

  return null;
}



function responseCard(title, message, addAnotherLink, backLink) {

return `

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${title}</title>

<style>

body{
font-family:system-ui;
background:#f4f6f8;
display:flex;
justify-content:center;
padding-top:80px;
}

.panel{
background:white;
padding:30px;
border-radius:10px;
width:400px;
text-align:center;
box-shadow:0 10px 30px rgba(0,0,0,0.1);
}

.btn{
display:inline-block;
padding:10px 18px;
border-radius:6px;
text-decoration:none;
margin:10px;
}

.primary{
background:#27ae60;
color:white;
}

.secondary{
background:#e5e7eb;
color:black;
}

</style>

</head>

<body>

<div class="panel">

<h2>${title}</h2>

<p>
${message}
</p>

<a href="${addAnotherLink}" class="btn primary">
Add Another Article
</a>

<a href="${backLink}" class="btn secondary">
Back
</a>

</div>

</body>

</html>

`;

}



async function addArticleController(req, res) {

  try {

    const { title, content, productLinks = [] } = req.body;

    const creator = getCreatorId(req);

    if (!creator) {
      return res.redirect("/login");
    }

    const addAnotherLink =
      creator.role === "admin"
        ? "/admin/addArticle"
        : "/userPanel/addArticle";

    const backLink =
      creator.role === "admin"
        ? "/admin"
        : "/userPanel";


    if (!title || !content) {

      return res
        .status(400)
        .send(
          responseCard(
            "Submission Failed",
            "Title and content are required.",
            addAnotherLink,
            backLink
          )
        );
    }


    let coverImageUrl = null;


    if (req.file) {

      const result = await uploadToCloudinary(req.file.buffer, "image");

      coverImageUrl = result.secure_url;

    }


    const articleData = {

      title,

      content,

      coverImage: coverImageUrl,

      productLinks: Array.isArray(productLinks)
        ? productLinks
        : [productLinks],

      createdAt: new Date(),

      updatedAt: new Date(),

      creatorId: creator.id,

      companyName: creator.companyName,

      creatorRole: creator.role,
    };


    await Article.create(articleData);


    res.send(
      responseCard(
        "Article Published",
        "The article has been saved successfully.",
        addAnotherLink,
        backLink
      )
    );

  } catch (error) {

    console.error("Error adding article:", error);

    const creator = getCreatorId(req);

    const addAnotherLink =
      creator && creator.role === "admin"
        ? "/admin/addArticle"
        : "/userPanel/addArticle";

    const backLink =
      creator && creator.role === "admin"
        ? "/admin"
        : "/userPanel";

    res
      .status(500)
      .send(
        responseCard(
          "Error",
          "Something went wrong while publishing the article.",
          addAnotherLink,
          backLink
        )
      );
  }
}


export { addArticlePageController, addArticleController };