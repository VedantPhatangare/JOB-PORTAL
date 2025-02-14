import { Request } from 'express';
import multer, {FileFilterCallback} from 'multer';
import path from 'path'
import { fileURLToPath } from 'url';
import fs from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirnam = path.dirname(__filename);
const uploadDir = path.join(__dirnam, '../..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`)
    }
  })
  
//   filefilter
  const fileFilter = (req:Request,file:Express.Multer.File,cb:FileFilterCallback)=>{
    const allowedExt = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if(allowedExt.includes(ext)){
        cb(null, true)
    }else{
        cb(new Error('Only pdf, doc, docx files are allowed'), false)
    }
  }

  const Fileupload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits:{fileSize: 1024 * 1024 * 5}
   });
  
  export default Fileupload;