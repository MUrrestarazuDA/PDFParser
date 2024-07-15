import { PDFDocument, rgb } from 'pdf-lib';
import { readFile, writeFile } from 'fs/promises';
import JSZip from 'jszip';
import path from 'path';
import { fileURLToPath } from 'url';

// Convertir la URL a una ruta de archivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta al archivo PDF de entrada y salida
const pdfFilePath = path.join(__dirname, '..', '..', 'Public', 'albaran.pdf');



// Función para modificar un archivo PDF
async function modifyPDF(pedido) {
  let totalQuantity = 0; 
  let subTotal = 0;
  try {
    // Lee el archivo PDF
    const pdfBuffer = await readFile(pdfFilePath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // Modifica el contenido del PDF según la información en jsonData
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    // Ejemplo de escritura de texto en el PDF
    firstPage.drawText('Fecha Pedido ' + getToday(), {
      x: width * 0.08,
      y: height * 0.595,
      size: 10,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(getToday(), {
      x: width * 0.27,
      y: height * 0.705,
      size: 10,
      color: rgb(0, 0, 0),
    });
    
    for (let i = 0; i < pedido.Productos.length; i++) {
      firstPage.drawText(pedido.Productos[i].Nº, {
        x: width * 0.08,
        y: height * (0.57 - i * 0.04),
        size: 10,
        color: rgb(0, 0, 0),
      });

      // Procesar descripción para manejar más de 6 palabras
      let descripcion = pedido.Productos[i].Description;
      if (descripcion.includes('μ')) {
        
        descripcion = descripcion.replace(/μ/g, '');
      }
      const palabras = descripcion.split(' ');
      let descripcionLinea1 = '';
      let descripcionLinea2 = '';

      if (palabras.length > 5) {
        descripcionLinea1 = palabras.slice(0, 5).join(' ');
        descripcionLinea2 = palabras.slice(5).join(' ');
      } else {
        descripcionLinea1 = descripcion;
      }

      firstPage.drawText(descripcionLinea1, {
        x: width * 0.23,
        y: height * (0.57 - i * 0.04),
        size: 10,
        color: rgb(0, 0, 0),
      });
      if (descripcionLinea2) {
        const firstLine = height * (0.57 - i * 0.04)
        const secondLineY = height * (0.57 - i * 0.04) - 10.5;
        firstPage.drawText(descripcionLinea2, {
          x: width * 0.23,
          y: secondLineY,
          size: 10,
          color: rgb(0, 0, 0),
        });
      }
    
      firstPage.drawText( pedido.Productos[i].Quantity.toString(), {
        x: width * 0.58,
        y: height * (0.57 - i * 0.04),
        size: 10,
        color: rgb(0, 0, 0),
      });
      if(pedido.Productos[i]['Unit Price']){
      firstPage.drawText( pedido.Productos[i]['Unit Price'].toString(), {
        x: width * 0.645,
        y: height * (0.57 - i * 0.04),
        size: 10,
        color: rgb(0, 0, 0),
      });
      
      firstPage.drawText( '21.0', {
        x: width * 0.77,
        y: height * (0.57 - i * 0.04),
        size: 10,
        color: rgb(0, 0, 0),
      });
      firstPage.drawText( (pedido.Productos[i].Quantity*pedido.Productos[i]['Unit Price']).toFixed(2).toString(), {
        x: width * 0.87,
        y: height * (0.57 - i * 0.04),
        size: 10,
        color: rgb(0, 0, 0),
      });
       totalQuantity= pedido.Productos[i].Quantity+totalQuantity
      subTotal= (pedido.Productos[i].Quantity*pedido.Productos[i]['Unit Price'])+ subTotal
      
    }
    firstPage.drawText( totalQuantity.toString(), {
      x: width * 0.58,
      y: height * (0.165),
      size: 10,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText( subTotal.toString(), {
      x: width * 0.87,
      y: height * (0.165),
      size: 10,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText( subTotal.toString(), {
      x: width * 0.45,
      y: height * (0.115),
      size: 10,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText( (subTotal*0.21).toFixed(2).toString(), {
      x: width * 0.58,
      y: height * (0.115),
      size: 10,
      color: rgb(0, 0, 0),
    });    
    
    firstPage.drawText( ((subTotal*0.21)+subTotal).toFixed(2).toString()+" €", {
      x: width * 0.85,
      y: height * (0.115),
      size: 12,
      color: rgb(0, 0, 0),
    });
  }
 
// Guarda el PDF modificado en memoria
const pdfBytes = await pdfDoc.save();

// Devuelve el nombre del archivo generado
const fileName = `Albaran_${pedido.Pedido}.pdf`;
return { fileName, pdfBytes };

   
  } catch (error) {
    console.error('Error al modificar el PDF:', error);
  }
}

function leerlos() {
  console.log("hola")
}

function parseJsonData(jsonData) {

  // Número de pedidos
  const numeroPedidos = Object.keys(jsonData).length;

  // Número de productos
  let numeroProductos = 0;
  const pedidosArray = [];

  for (const key in jsonData) {
    numeroProductos += jsonData[key].length;

    const pedido = {
      'Pedido': key,
      'Productos': jsonData[key]
    };

    pedidosArray.push(pedido);
  }


  return pedidosArray;
}

async function CreatePDF(jsonData) {
  const pedidos = parseJsonData(jsonData);
  const zip = new JSZip();

  for (let index = 0; index < pedidos.length; index++) {
    const { fileName, pdfBytes } = await modifyPDF(pedidos[index]);
    zip.file(fileName, pdfBytes);
  }

  // Genera el archivo ZIP en memoria
  const zipBytes = await zip.generateAsync({ type: 'nodebuffer' });

  // Devuelve el archivo ZIP en memoria
  return zipBytes;
}

function getToday() {
  let now = new Date();
  let options = { timeZone: 'Europe/Madrid', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit' };
  let formatter = new Intl.DateTimeFormat('es-ES', options);
  let parts = formatter.formatToParts(now);
  let day = parts.find(p => p.type === 'day').value;
  let month = parts.find(p => p.type === 'month').value;
  let hour = parts.find(p => p.type === 'hour').value;
  let year = parts.find(p => p.type === 'year').value;
  const date = day + "/" + month + "/" + year
  return date;
}

export default {
  modifyPDF,
  leerlos,
  CreatePDF

}