import PDFParser from 'pdf-parse';
import editortPDF from './editortPDF.js';

async function processPDF(req, res) {
    try {
        if (!req.files || req.files.length === 0) {
            throw new Error('No se han proporcionado archivos PDF');
        }
        let pedidos = [];
        const resultados = [];

        for (const file of req.files) {
            const dataBuffer = file.buffer;
            const pdfData = await PDFParser(dataBuffer);
            const textoPDF = pdfData.text.split("\n");

           
            let currentPedido = "";
            for (let index = 0; index < textoPDF.length; index++) {
                const line = textoPDF[index].trim();
                if (line.startsWith("Su pedido nº:")) {
                    // Extraer número de pedido
                    const regex = /Su pedido nº: (.*?) Enviado/;
                    const resultado = line.match(regex);                    
                    if (resultado && resultado.length >= 2) {
                        currentPedido = resultado[1].trimEnd();;
                        if (!pedidos[currentPedido]) {
                            pedidos[currentPedido] = [];
                        }
                    } else {
                        console.log('No se encontró el pedido.');
                    }
                }

                if (line.includes("#")) {
                    // Expresión regular para capturar referencia y descripción
                    const regex = /#\d*(\w+-\d{3}-\d{3})(.+)/;

                    // Aplicar la expresión regular al texto
                    const resultado = line.match(regex);

                    // Verificar el resultado
                    if (resultado && resultado.length > 1) {
                        const referencia = resultado[1];
                        let descripcion = resultado[2].trim();
                        const matches = descripcion.match(/\d+/g);
                        const Quantity = matches ? matches.pop() : '';
                        if (Quantity) {
                            descripcion = descripcion.replace(new RegExp(Quantity + '$'), '').trim();
                        }
                        let item = {
                            'Nº': referencia,
                            Description: descripcion,
                            Quantity:Quantity
                        }
                        if (pedidos[currentPedido]) {
                            pedidos[currentPedido].push(item);
                        } else {
                            pedidos[currentPedido] = [item];
                        }
                        console.log("Referencia:", referencia);
                        console.log("Descripción:", descripcion);
                        console.log("Cantidad:", Quantity);

                    } else {
                        // Lógica especial si la expresión regular principal falla
                        const fallbackRegex = /#(\d+)([A-Z]+-\w+-\w{1,3})(.{3})(.+)/;
                        const fallbackResultado = line.match(fallbackRegex);

                        if (fallbackResultado && fallbackResultado.length > 4) {
                            const referencia = fallbackResultado[2];
                            let descripcion = line.split(referencia)[1].trim();

                            // Encontrar el último valor numérico en la descripción
                            let matches = descripcion.match(/\d+/g);
                            let Quantity = matches ? matches.pop() : '';

                            // Quitar la cantidad de la descripción
                            if (Quantity) {
                                descripcion = descripcion.replace(new RegExp(Quantity + '$'), '').trim();
                            }
                            let item = {
                                'Nº': referencia,
                                Description: descripcion,
                                Quantity:Quantity
                            }

                            if (pedidos[currentPedido]) {
                                pedidos[currentPedido].push(item);
                            } else {
                                pedidos[currentPedido] = [item];
                            }
                            console.log("Referencia:", referencia);
                            console.log("Descripción:", descripcion);
                            console.log("Cantidad:", Quantity);
                        } else {
                            console.log('No se encontró la referencia y descripción.', line);                            
                            
                            
                            let item = {
                                'Nº': 'COSS-1K4-500' ,
                                Description: 'Disolución patrón de conductividad 1413 µS/cm (25 ºC) , 500 ml',
                                Quantity:'1'
                            }
                            if (pedidos[currentPedido]) {
                                pedidos[currentPedido].push(item);
                            } else {
                                pedidos[currentPedido] = [item];
                            }

                        }
                    }
                }
            }
            console.log( pedidos )
           /*  resultados.push({
                originalname: file.originalname,
                text: textoPDF,
            }); */
        }

        const filesZiped = await editortPDF.CreatePDF(pedidos);

        // Enviar el archivo ZIP como respuesta
        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', 'attachment; filename=archivo.zip');       
        res.send(filesZiped);
        // Devuelve los resultados en un objeto JSON
        //res.json(resultados);
    } catch (error) {
        console.error('Error al procesar los archivos PDF:', error);
        res.status(500).json({ error: 'Error al procesar los archivos PDF' });
    }
}




function parseData() {
    console.log("hola")
}

export default {
    processPDF,
    parseData
};
