// import Articulo from "../models/Articulo.js";
// import TipoArticulo from "../models/TipoArticulo.js";
import sequelize from "../config/db.js";
import { QueryTypes } from "sequelize";
import ExcelJS from "exceljs";
import { buildPDF } from "../libs/pdfKit.js";
// import Proveedor from "../models/Proveedor.js";
import { Articulo, Proveedor, TipoArticulo } from "../models/Associaciones.js"; // ✅ Importamos desde asociaciones

const altaExcelArticulo = async (req, res) => {
  const articulos = req.body;

  try {
    const tipoArticulos = await TipoArticulo.findAll();

    //BUSCA SI EL ARTICULO.ID_TIPOARTICULOFK O FAMILIA ES IGUAL A LA DESCRIPCION DE LA TABLA DE TIPO DE ARTICULOS, ENTONCES DEVUELVE EL OBJETO Y REEMPLAZA ELTIPOARTICULO
    // O FAMILIA POR EL ID, CASO CONTRARIO LO DEJA EN NULL PARA QUE NO DE ERROR.
    const articulosMapeados = articulos.map((articulo) => {
      const tipoArticuloEncontrado = tipoArticulos.find(
        (tipo) => tipo.dataValues.descripcion === articulo.id_tipoArticuloFK
      );

      if (tipoArticuloEncontrado) {
        return {
          ...articulo,
          id_tipoArticuloFK: Number(tipoArticuloEncontrado.dataValues.id),
          precio:
            articulo.precio != null ? Number(articulo.precio / 1000) : null,
        };
      }
      return {
        ...articulo,
        id_tipoArticuloFK: null,
        precio: articulo.precio != null ? Number(articulo.precio / 1000) : null,
      };
    });

    const resultados = await Articulo.bulkCreate(articulosMapeados);

    return res
      .status(200)
      .json({ msg: "Artículos insertados con éxito", resultados });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const altaArticulo = async (req, res) => {
  try {
    const {
      codigo,
      descripcion,
      precio,
      codigoBarra,
      tipoArticulo,
      stock,
      color,
      proveedor,
    } = req.body;

    // 1️⃣ Validar datos obligatorios
    if (
      !codigo ||
      !descripcion ||
      !precio ||
      !codigoBarra ||
      !tipoArticulo ||
      !stock ||
      !color ||
      !proveedor
    ) {
      return res.status(400).json({ msg: "Faltan datos obligatorios" });
    }

    // 2️⃣ Convertir `precio` y `stock` a número para evitar errores
    const precioNumerico = parseFloat(precio);
    const stockNumerico = parseInt(stock, 10);

    if (isNaN(precioNumerico) || isNaN(stockNumerico)) {
      return res.status(400).json({ msg: "Precio o stock inválidos" });
    }

    // 3️⃣ Buscar o crear el artículo con `findOrCreate`
    const [articulo, created] = await Articulo.findOrCreate({
      where: { codigo_buscador: String(codigo) },
      defaults: {
        descripcion,
        precio: precioNumerico.toFixed(3),
        codigo_barra: codigoBarra,
        stock: stockNumerico,
        color,
        id_tipoArticuloFK: tipoArticulo.id,
        id_proveedorFK: proveedor.id,
      },
    });

    if (!created) {
      return res
        .status(400)
        .json({ msg: "Ya existe un artículo con ese código." });
    }

    // 4️⃣ Recuperar el artículo con sus relaciones
    const respuesta = await Articulo.findOne({
      where: { codigo_buscador: codigo },
      include: [
        {
          model: TipoArticulo,
          as: "tipoArticulo",
          attributes: ["id", "descripcion"],
        },
        {
          model: Proveedor,
          as: "proveedor",
          attributes: ["id", "descripcion"],
        },
      ],
    });

    return res.json({
      msg: "Artículo creado con éxito",
      respuesta,
    });
  } catch (error) {
    console.error("Error en altaArticulo:", error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};

const editarArticulo = async (req, res) => {
  try {
    const { codigo } = req.params; // Código original
    const {
      descripcion,
      precio,
      codigoBarra,
      tipoArticulo,
      stock,
      color,
      proveedor,
    } = req.body;

    // 1️⃣ Validar datos obligatorios
    if (
      !descripcion ||
      !precio ||
      !codigoBarra ||
      !tipoArticulo ||
      !stock ||
      !color ||
      !proveedor
    ) {
      return res.status(400).json({ msg: "Faltan datos obligatorios" });
    }

    // 2️⃣ Convertir `precio` y `stock` a número para evitar errores
    const precioNumerico = parseFloat(precio);
    const stockNumerico = parseInt(stock, 10);

    if (isNaN(precioNumerico) || isNaN(stockNumerico)) {
      return res.status(400).json({ msg: "Precio o stock inválidos" });
    }

    // 3️⃣ Verificar si el artículo existe
    const articulo = await Articulo.findOne({
      where: { codigo_buscador: codigo },
    });

    if (!articulo) {
      return res.status(404).json({ msg: "Artículo no encontrado" });
    }

    // 4️⃣ Actualizar el artículo
    await Articulo.update(
      {
        descripcion,
        codigo_barra: codigoBarra,
        precio: precioNumerico.toFixed(3),
        color,
        stock: stockNumerico,
        id_tipoArticuloFK: tipoArticulo.id,
        id_proveedorFK: proveedor.id,
      },
      { where: { codigo_buscador: codigo } }
    );

    // 5️⃣ Recuperar el artículo actualizado con sus relaciones
    const articuloActualizado = await Articulo.findOne({
      where: { codigo_buscador: codigo },
      include: [
        {
          model: TipoArticulo,
          as: "tipoArticulo",
        },
        {
          model: Proveedor,
          as: "proveedor",
        },
      ],
    });

    return res.json({
      msg: "Artículo actualizado exitosamente",
      articuloActualizado,
    });
  } catch (error) {
    console.error("Error en editarArticulo:", error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};

// LISTADO DE ARTICULOS
const listadoArticulo = async (req, res) => {
  try {
    const respuesta = await Articulo.findAll({
      include: [
        {
          model: TipoArticulo,
          as: "tipoArticulo",
        },
        {
          model: Proveedor,
          as: "proveedor",
        },
      ],
    });

    return res.json(respuesta);
  } catch (error) {
    console.log(error);
    return res.status(401).json({ msg: error.message });
  }
};

// Eliminar un articulo desde la tabla
const eliminarArticulo = async (req, res) => {
  if (!req.params) {
    return res.status(500).json({ msg: "No se envió ningún codigo" });
  }

  const codigo_buscador = req.params.codigo_buscador;
  try {
    const respuesta = await Articulo.destroy({
      where: {
        codigo_buscador: codigo_buscador,
      },
    });
    return res.json({ msg: "Artículo eliminado correctamente", respuesta });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

// Actualizacion masiva de importes mediante excel
const articuloExcelEditar = async (req, res) => {
  const articulos = req.body;

  //Si algun articulo viene sin codigo retorna con el mensaje al front
  for (const articulo of articulos) {
    if (!articulo.codigo) {
      return res
        .status(500)
        .json({ msg: `Hay un artículo sin codigo, no se pudo actualizar.` });
    }
  }

  // Iniciar una transacción
  const transaccion = await sequelize.transaction();

  try {
    // Mapear las actualizaciones en un arreglo de promesas, asi es mas rapido y no actualiza uno por uno
    const updates = await Promise.all(
      articulos.map(async (articulo) => {
        const precioRedondeado = parseFloat(articulo.precio).toFixed(3);
        await Articulo.update(
          {
            precio: precioRedondeado,
          },
          {
            where: {
              codigo_buscador: String(articulo.codigo),
            },
            transaction: transaccion, // Asociar la transacción a la actualización
          }
        );

        return {
          ...articulo,
          precio: precioRedondeado,
        };
      })
    );

    // Confirmar la transacción (todas las actualizaciones se aplicarán)
    await transaccion.commit();
    // Si llegas a este punto, significa que todas las actualizaciones se realizaron con éxito

    // Aca, updates es un arreglo de promesas, por lo que no te va a devolver nada para devolver al front, en ese caso se tendria que poner un return articulo dentro del .map
    return res
      .status(200)
      .json({ msg: `Artículos actualizados con éxito.`, updates });
  } catch (error) {
    // Si ocurre un error, hacer un rollback de la transacción para deshacer todas las actualizaciones
    console.log(error);
    await transaccion.rollback();
    return res.status(500).json({ msg: error.message });
  }
};

// Actualizar los importes desde boton
const actualizarPrecios = async (req, res) => {
  const articulosFront = req.body;

  // Iniciar una transacción
  const transaccion = await sequelize.transaction();

  const articulos_a_modificar = articulosFront.map((articulo) => {
    return {
      id: articulo.id,
      codigo_buscador: articulo.codigo_buscador,
      precio: articulo.precio,
    };
  });

  try {
    const updates = await Promise.all(
      articulos_a_modificar.map(async (articulo) => {
        await Articulo.update(
          {
            precio: articulo.precio, // Nuevo precio que viene desde el front
          },
          {
            where: {
              codigo_buscador: articulo.codigo_buscador, // Selecciono los registros que coinciden con los códigos que vienen desde el front
            },
            transaction: transaccion, // Asociar la transacción a la actualización
          }
        );

        // Confirmar la transacción (todas las actualizaciones se aplicarán)

        return articulo;
      })
    );

    await transaccion.commit();

    return res.json({
      msg: "Los articulos se actualizaron exitosamente!",
      updates,
    });
  } catch (error) {
    console.log(error);
    await transaccion.rollback();
    return res.status(500).json({ msg: error.message, error });
  }
};

const buscarCodigoBarra = async (req, res) => {
  try {
    const { filtro: codigo_barra } = req.body; // Se recibe como `filtro` y se mapea a `codigo_barra`

    // 1️⃣ Validar que se ingrese un código de barras
    if (!codigo_barra) {
      return res
        .status(400)
        .json({ msg: "Debe ingresar un código de barras válido" });
    }

    // 2️⃣ Buscar el artículo junto con el tipo de artículo
    const articulo = await Articulo.findOne({
      where: { codigo_barra },
      include: [
        {
          model: TipoArticulo,
          as: "tipoArticulo",
        },
        {
          model: Proveedor,
          as: "proveedor",
        },
      ],
    });

    if (!articulo) {
      return res.status(404).json({ msg: "El código de barra no existe" });
    }

    return res.json({
      id: articulo.id,
      descripcion: articulo.descripcion,
      codigo_barra: articulo.codigo_barra,
      precio: articulo.precio,
      color: articulo.color,
      codigo_buscador: articulo.codigo_buscador,
      stock: articulo.stock,
      tipoArticulo: articulo.tipoArticulo,
      proveedor: articulo.proveedor,
    });
  } catch (error) {
    console.error("Error en buscarCodigoBarra:", error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};

const generarPDF = async (req, res) => {
  // console.log(req.body)
  const { articulosSeleccionados, tituloPDF } = req.body;

  const stream = res.writeHead(200, {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=${tituloPDF}.pdf`,
  });

  buildPDF(
    (data) => stream.write(data),
    () => stream.end(),
    articulosSeleccionados,
    tituloPDF
  );
};

const backupManuales = async (req, res) => {
  try {
    const articulosManuales = await sequelize.query(
      `SELECT id, codigo_buscador, descripcion, precio, stock, color, codigo_barra, id_tipoArticuloFK 
    FROM articulos`,
      { type: QueryTypes.SELECT }
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Articulos");

    // Añadir encabezados de columna
    worksheet.addRow([
      "id",
      "descripcion",
      "codigo_barra",
      "codigo_buscador",
      "precio",
      "color",
      "id_tipoArticuloFK",
      "stock",
    ]);

    // Añadir filas de datos
    articulosManuales.forEach((articuloManual) => {
      worksheet.addRow([
        articuloManual.id,
        articuloManual.descripcion,
        articuloManual.codigo_barra,
        articuloManual.codigo_buscador,
        articuloManual.precio,
        articuloManual.color,
        articuloManual.id_tipoArticuloFK,
        articuloManual.stock,
      ]);
    });

    // Obtener la fecha actual
    const today = new Date();

    // Obtener el día, mes y año
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();

    // Formatear la fecha como "dd-mm-aaaa"
    const formattedDate = `${day}-${month}-${year}`;

    // Generar el nombre del archivo con la fecha formateada
    const fileName = `backup-${formattedDate}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    await workbook.xlsx.write(res);

    return res.end();
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .send({ message: "Ha ocurrido un error de servidor :(" });
  }
};

export {
  altaExcelArticulo,
  altaArticulo,
  editarArticulo,
  listadoArticulo,
  eliminarArticulo,
  articuloExcelEditar,
  actualizarPrecios,
  buscarCodigoBarra,
  generarPDF,
  backupManuales,
};
