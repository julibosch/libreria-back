import PDFDocument from 'pdfkit-table';

export const buildPDF = (dataCallback, endCallback, articulosSeleccionados, tituloPDF) => {
  const doc = new PDFDocument();
  
  doc.on('data', dataCallback);
  doc.on('end', endCallback);

  // Estructura de datos para la tabla
  const tableData = {
    title: { label:tituloPDF, fontSize: 20, align: 'center' },
    headers: [
      { label:"Codigo", fontSize: 17 },
      { label:"Descripcion", fontSize: 17 },
      { label:"Precio", fontSize: 17 },
    ],
    rows: articulosSeleccionados.map(articulo => [articulo.codigo_buscador, articulo.descripcion, Number(articulo.precio).toFixed(2)]),
  };

  const tableOptions = {
    width: 500,
    columnsSize: [75, 375, 50],
    divider: {
      header: { disabled: false, width: 2, opacity: 0.7 },
      horizontal: { disabled: false, width: 0.5, opacity: 0.1 },
    },
    minRowHeight: 12
  };

  doc.table(tableData, tableOptions);

  doc.end();
}