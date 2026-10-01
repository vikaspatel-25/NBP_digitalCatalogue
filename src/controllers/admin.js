import path from "path";

const reactIndexPath = path.resolve(process.cwd(), "frontend/dist/index.html");

async function adminPageController(req, res) {
  try {
    res.sendFile(reactIndexPath);
  } catch (error) {
    console.error("Error rendering admin page:", error);
    res.status(500).send("Internal Server Error");
  }
}

export { adminPageController };
