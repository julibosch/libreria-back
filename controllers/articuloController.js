import Articulo from "../models/Articulo.js";
import TipoArticulo from "../models/TipoArticulo.js";
import sequelize from "../config/db.js";

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
          precio: articulo.precio != null ? Number(articulo.precio / 1000) : null
        };
      }
      return {
        ...articulo,
        id_tipoArticuloFK: null,
        precio: articulo.precio != null ? Number(articulo.precio / 1000) : null
      };
    });

    const resultados = await Articulo.bulkCreate(articulosMapeados);

    return res.status(200).json({ msg: "Artículos insertados con éxito", resultados });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
}

const altaArticulo = async (req, res) => {
  const {
    codigo,
    descripcion,
    precio,
    codigoBarra,
    tipoArticulo,
    stock,
    color,
  } = req.body;

  let idTipoArticulo = ""; //Va a contener el id del tipo de articulo

  if (!tipoArticulo) {
    return res.status(401).json({ msg: "Debe ingresar un tipo de artículo" });
  }

  //Nos traemos el id del tipo de articulo y ademas validamos que exista en la base de datos.
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
  const { codigo } = req.params;
  const {
    descripcion,
    precio,
    codigoBarra,
    tipoArticulo,
    stock,
    color,
  } = req.body;

  let idTipoArticulo;

  try {

    const respuesta = await Articulo.findAll({
      where: {
        codigo_buscador: codigo
      }
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
        codigo_buscador: codigo,
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
    console.log(error)
    return res.status(401).json({ msg: error.message });
  }
};

// LISTADO DE ARTICULOS
const listadoArticulo = async (req, res) => {
  const consultaSQL = `
    SELECT articulos.descripcion AS descripcion, articulos.id AS id, color, precio, codigo_buscador, codigo_barra, stock,
    tipo_articulos.descripcion AS tipoArticulo
    FROM articulos
    INNER JOIN tipo_articulos
    ON articulos.id_tipoArticuloFK = tipo_articulos.id
    group by codigo_buscador
    ;
  `;
  try {
    await sequelize.query("SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'");
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
        codigo_buscador: codigo_buscador
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
      return res.status(500).json({ msg: `Hay un artículo sin codigo, no se pudo actualizar.` });
    }
  }

  // Iniciar una transacción
  const transaccion = await sequelize.transaction();

  try {
    // Mapear las actualizaciones en un arreglo de promesas, asi es mas rapido y no actualiza uno por uno
    const updates = await Promise.all(articulos.map(async (articulo) => {
      const precioRedondeado = parseFloat(articulo.precio).toFixed(3);
      await Articulo.update(
        {
          precio: precioRedondeado,
        },
        {
          where: {
            codigo_buscador: articulo.codigo,
          },
          transaction: transaccion, // Asociar la transacción a la actualización
        }
      );

      return {
        ...articulo,
        precio: precioRedondeado
      };
    }));
    // Esperar a que se completen todas las actualizaciones en paralelo
    // await Promise.all(updates);
    
    // Confirmar la transacción (todas las actualizaciones se aplicarán)
    await transaccion.commit();

    // Si llegas a este punto, significa que todas las actualizaciones se realizaron con éxito

    // Aca, updates es un arreglo de promesas, por lo que no te va a devolver nada para devolver al front, en ese caso se tendria que poner un return articulo dentro del .map
    return res.status(200).json({ msg: `Artículos actualizados con éxito.`, updates });
  } catch (error) {
    // Si ocurre un error, hacer un rollback de la transacción para deshacer todas las actualizaciones
    await transaccion.rollback();
    console.log(error);
    return res.status(500).json({ msg: error.message });
  }
}

// Actualizar los importes desde boton
const actualizarPrecios = async (req, res) => {
  const articulosFront = req.body;

    // Iniciar una transacción
  const transaccion = await sequelize.transaction();

  const articulos_a_modificar = articulosFront.map(articulo => {
    return {
      id: articulo.id,
      codigo_buscador: articulo.codigo_buscador,
      precio: articulo.precio
    }
  });

  try {
    const updates = await Promise.all(articulos_a_modificar.map(async (articulo) => {
      await Articulo.update(
        {
          precio: articulo.precio // Nuevo precio que viene desde el front
        },
        {
          where: {
            codigo_buscador: articulo.codigo_buscador // Selecciono los registros que coinciden con los códigos que vienen desde el front
          },
          transaction: transaccion, // Asociar la transacción a la actualización
        }
      );

      // Confirmar la transacción (todas las actualizaciones se aplicarán)
      
      return articulo;
    }));
  
    await transaccion.commit();
    
    return res.json({msg: "Los articulos se actualizaron exitosamente!", updates});
  } catch (error) {
    console.log(error)
    await transaccion.rollback();
    return res.status(500).json({ msg: error.message, error });
  }
}

export {
  altaExcelArticulo,
  altaArticulo,
  editarArticulo,
  listadoArticulo,
  eliminarArticulo,
  articuloExcelEditar,
  actualizarPrecios,
};
