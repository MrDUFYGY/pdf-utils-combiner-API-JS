const express = require('express');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Configuración de Multer para subir archivos
const upload = multer({ dest: 'uploads/' });

// Ruta para subir y combinar archivos
router.post('/upload', upload.array('files', 50), async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length < 2) {
      return res.status(400).send('Debes subir al menos 2 archivos.');
    }

    // Crear un PDF combinado
    const combinedPdf = await PDFDocument.create();
    for (const file of files) {
      const pdfBytes = fs.readFileSync(file.path);
      const pdf = await PDFDocument.load(pdfBytes);
      const pages = await combinedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => combinedPdf.addPage(page));
      fs.unlinkSync(file.path); // Eliminar archivo temporal
    }

    const combinedPdfBytes = await combinedPdf.save();
    const outputPath = path.join(__dirname, '../uploads/combined.pdf');
    fs.writeFileSync(outputPath, combinedPdfBytes);

    // Descargar el archivo combinado
    res.download(outputPath, 'combined.pdf', () => {
      fs.unlinkSync(outputPath); // Eliminar el PDF combinado
    });
  } catch (error) {
    console.error('Error al combinar los archivos:', error);
    res.status(500).send('Error al combinar los archivos.');
  }
});

module.exports = router;
