import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "../views/pages/admin.ejs");

async function adminPageController(req, res) {
  try {
    res.render(filePath);
  } catch (error) {
    console.error("Error rendering admin page:", error);
    res.status(500).send("Internal Server Error");
  }
}

export { adminPageController };
