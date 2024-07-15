import { Router } from 'express';
import excelReaderController from './../controllers/excelReaderController.js'
import multer from 'multer';
const router = Router();



const upload = multer({
    storage: multer.memoryStorage(), 
  });

router.post('/upload', upload.array('xlsxFiles',10), excelReaderController.processExcel);


  

  export default router;