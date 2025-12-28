import multer from "multer";

let upload;

try {
  const storage = multer.memoryStorage();
  upload = multer({ storage });
} catch (error) {
  console.error("Error setting up multer:", error);
  throw error;
}

export default upload;
