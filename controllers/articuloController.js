import Articulo from "../models/Articulo.js";
import TipoArticulo from "../models/TipoArticulo.js";
import sequelize from "../config/db.js";
import { buildPDF } from "../libs/pdfKit.js";

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
    const consultaSQL = "UPDATE articulos SET codigo_buscador = REPLACE(codigo_buscador,' ','');";

    try {
      const update = await Articulo.sequelize.query(consultaSQL, {
        type: Articulo.sequelize.QueryTypes.UPDATE, // Tipo de consulta
      });
      console.log("Filas afectadas:", update[1]);
    } catch (error) {
      console.error("Error al ejecutar la consulta:", error);
    }
  return;
  const {
    codigo,
    descripcion,
    precio,
    codigoBarra,
    tipoArticulo,
    stock,
    color,
  } = req.body;

  try {
    const articuloEncontrado = await Articulo.findOne({
      where: {
        codigo_buscador: String(codigo),
      },
    });

    if (articuloEncontrado) {
      return res
        .status(401)
        .json({ msg: "Ya existe un artículo con ese código." });
    }
  } catch (error) {
    console.log(error);
  }

  let idTipoArticulo = ""; //Va a contener el id del tipo de articulo

  if (!tipoArticulo) {
    return res.status(401).json({ msg: "Debe ingresar un tipo de artículo" });
  }

  //Nos traemos el id del tipo de articulo y ademas validamos que exista en la base de datos.
  try {
    const respuesta = await TipoArticulo.findOne({
      where: {
        descripcion: tipoArticulo,
      },
    });

    //Si alicia escribe en el input y no selecciona ninguna tipo de articulo existente.
    if (!respuesta) {
      return res.status(500).json({ msg: "No existe ese tipo de articulo" });
    }

    idTipoArticulo = respuesta.dataValues.id; //Le paso el id del tipo articulo a una variable global, porque sino no puedo usar datavalues por el scop

  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }

  try {
    const respuesta = await Articulo.create({
      codigo_buscador: codigo,
      descripcion,
      precio,
      codigo_barra: codigoBarra,
      stock,
      color,
      id_tipoArticuloFK: idTipoArticulo,
    });
    return res.json({
      respuesta,
      msg: "Artículo creado con exito",
      descripcionTipoArticulo: tipoArticulo,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// EDITAR ARTICULO
const editarArticulo = async (req, res) => {
  const { codigo } = req.params; //Codigo original
  const { descripcion, precio, codigoBarra, tipoArticulo, stock, color } =
    req.body;

  let idTipoArticulo;

  try {
    const respuesta = await Articulo.findAll({
      where: {
        codigo_buscador: codigo,
      },
    });

    if (!respuesta) {
      return res.status(404).json({ msg: "Artículo no encontrado" });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }

  try {
    const { dataValues } = await TipoArticulo.findOne({
      where: {
        descripcion: tipoArticulo,
      },
    });

    idTipoArticulo = dataValues.id; //Le paso el id del tipo articulo a una variable global, porque sino no puedo usar datavalues por el scop

    if (!idTipoArticulo) {
      return res.status(500).json({ msg: "No existe ese tipo de articulo" });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }

  try {
    const respuesta = await Articulo.update(
      {
        descripcion: descripcion,
        codigo_barra: codigoBarra,
        precio: precio,
        color: color,
        stock: stock,
        id_tipoArticuloFK: idTipoArticulo,
      },
      {
        where: {
          codigo_buscador: codigo,
        },
      }
    );

    const articuloActualizado = {
      codigo_buscador: codigo,
      descripcion: descripcion,
      codigo_barra: codigoBarra,
      precio: parseFloat(precio).toFixed(3),
      color: color,
      tipoArticulo: tipoArticulo,
      stock: Number(stock),
    };

    if (respuesta > 0) {
      return res.json({
        msg: "Artículo actualizado exitosamente",
        articuloActualizado,
        respuesta,
      });
    }
    return res.json({ msg: "No hubo modificaciones", respuesta });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ msg: error.message });
  }
};

// LISTADO DE ARTICULOS
const listadoArticulo = async (req, res) => {
  const consultaSQL = `
    SELECT
      articulos.descripcion AS descripcion,
      articulos.id AS id,
      color,
      precio,
      codigo_buscador,
      codigo_barra,
      stock,
      tipo_articulos.descripcion AS tipoArticulo
    FROM articulos
    INNER JOIN tipo_articulos
    ON articulos.id_tipoArticuloFK = tipo_articulos.id
    GROUP BY codigo_buscador
    ORDER BY
    CAST(SUBSTRING_INDEX(codigo_buscador, ' ', 1) AS SIGNED) ASC,
    SUBSTRING_INDEX(codigo_buscador, ' ', -1) ASC;
  `;
  try {
    await sequelize.query(
      "SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'"
    );
    const respuesta = await Articulo.sequelize.query(consultaSQL, {
      type: Articulo.sequelize.QueryTypes.SELECT, // Tipo de consulta
      include: TipoArticulo, // Incluye el modelo TipoArticulo en la consulta
    });

    res.json(respuesta);
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
  const { filtro: codigo_barra } = req.body; //Viene como filtro pero se pasa a codigoBarra

  try {
    const respuesta = await Articulo.findOne({
      where: {
        codigo_barra: codigo_barra,
      },
    });

    if (!respuesta) {
      return res.json({ msg: "El código de barra no existe" });
    }

    //Se trae la descripcion del tipo de articulo
    const respuestaTipo = await TipoArticulo.findOne({
      where: {
        id: respuesta.dataValues.id_tipoArticuloFK,
      },
    });

    //Este articulo se devuelve al front con el tipo de articulo de la descripcion
    const articulo = {
      id: respuesta.dataValues.id,
      descripcion: respuesta.dataValues.descripcion,
      codigo_barra: respuesta.dataValues.codigo_barra,
      precio: respuesta.dataValues.precio,
      color: respuesta.dataValues.color,
      codigo_buscador: respuesta.dataValues.codigo_buscador,
      stock: respuesta.dataValues.stock,
      tipoArticulo: respuestaTipo.dataValues.descripcion,
    };

    return res.json(articulo);
  } catch (error) {
    console.log(error);
    return res.status(401).json({ msg: error.message });
  }
};

const generarPDF = async (req, res) => {
  // console.log(req.body)
  const {articulosSeleccionados, tituloPDF} = req.body;

  const stream = res.writeHead(200, {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=${tituloPDF}.pdf`,
  })

  buildPDF(
    (data) => stream.write(data),
    () => stream.end(),
    articulosSeleccionados,
    tituloPDF
  );
}

export {
  altaExcelArticulo,
  altaArticulo,
  editarArticulo,
  listadoArticulo,
  eliminarArticulo,
  articuloExcelEditar,
  actualizarPrecios,
  buscarCodigoBarra,
  generarPDF
};
