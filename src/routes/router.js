import { Router } from 'express';
import pdfRouter from "./pdfRouter.js"
import excelRouter from "./excelRouter.js"



const router = Router();

router.use ('/pdf', pdfRouter);

router.use('/xlsx',excelRouter)

export default router;