import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Use raw for doc/docx, image(pdf) for auto preview
    const ext = path.extname(file.originalname).toLowerCase();
    const isRaw = ext === '.doc' || ext === '.docx';
    
    return {
      folder: 'jobportal/resumes',
      resource_type: isRaw ? 'raw' : 'auto',
      public_id: `${Date.now()}-${file.originalname.replace(ext, '')}`,
    };
  },
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === 'profileImage') {
    const allowedImageExt = ['.jpg', '.jpeg', '.png', '.webp'];
    if (allowedImageExt.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only jpg, jpeg, png, webp files are allowed for profile images') as any, false);
    }
  } else {
    // Defaults for resume, coverletter, etc.
    const allowedDocExt = ['.pdf', '.doc', '.docx'];
    if (allowedDocExt.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only pdf, doc, docx files are allowed for documents') as any, false);
    }
  }
};

const Fileupload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // 5MB limit
});

export default Fileupload;