import { Router } from 'express';
import pdfReaderController from './../controllers/pdfReaderController.js'
import multer from 'multer';
const router = Router();



const upload = multer({
    storage: multer.memoryStorage(), 
  });

router.post('/upload', upload.array('pdfFiles', 10), pdfReaderController.processPDF);


  

  export default router;