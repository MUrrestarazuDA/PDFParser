import xlsx from 'xlsx';
import editortPDF from './editortPDF.js';

async function processExcel(req, res) {
    try {
        if (!req.files || req.files.length === 0) {
            throw new Error('No se han proporcionado archivos Excel');
        }

        const results = [];

        for (let file of req.files) {
            const workbook = xlsx.read(file.buffer, { type: 'buffer' });
            const sheetNames = workbook.SheetNames;

            sheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = xlsx.utils.sheet_to_json(worksheet);
                results.push({ fileName: file.originalname, sheetName, data: jsonData });
            });
        }

        const separatedData = {};

        // Iterar sobre los resultados para separar los datos por "Your order"
        results.forEach(result => {
            result.data.forEach(item => {
                const orderKey = item["Your order"];

                if (!separatedData[orderKey]) {
                    separatedData[orderKey] = [];
                }

                separatedData[orderKey].push(item);
            });
        });

        console.log(separatedData)

        const filesZiped = await editortPDF.CreatePDF(separatedData);

        // Enviar el archivo ZIP como respuesta
        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', 'attachment; filename=archivo.zip');       
        res.send(filesZiped);

    } catch (error) {
        console.error('Error al procesar los archivos xlsx:', error.message);
        res.status(500).json({ error: 'Error al procesar los archivos xlsx' });
    }
}

function parseData() {
    console.log("hola");
}

export default {
    processExcel,
    parseData
};
