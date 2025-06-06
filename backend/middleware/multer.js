import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products", // Updated folder name
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    resource_type: "image",
  },
});

const upload = multer({ storage });

export default upload;
