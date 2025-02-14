import express,{Router} from "express";
import { apply } from "../controllers/applicationControllers.js";
import jwtVerify from "../middlewares/authMiddleware.js";
import Fileupload from "../middlewares/multerMiddleware.js";

const applicationRouter:Router = express.Router();

applicationRouter.post('/:job_id/apply',jwtVerify,Fileupload.fields([
    {name:"resume",maxCount:1},{name:"coverletter",maxCount:1}
]),apply);

export default applicationRouter;
