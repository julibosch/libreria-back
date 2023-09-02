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
    console.log(resultados)
    return res.status(200).json({ msg: "Artículos insertados con éxito" });
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
  const { id } = req.params;
  const {
    codigo,
    descripcion,
    precio,
    codigoBarra,
    tipoArticulo,
    stock,
    color,
  } = req.body;

  let articulo = {}; //Contiene el objeto que obtengo de la bd.
  let idTipoArticulo;

  try {
    const { dataValues } = await Articulo.findByPk(id);
    articulo = dataValues;

    if (!articulo) {
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
        // tipoArticulo: tipoArticulo,
        stock: stock,
        id_tipoArticuloFK: idTipoArticulo,
      },
      {
        where: {
          id: Number(id),
        },
      }
    );

    const articuloActualizado = {
      id: Number(id),
      codigo_buscador: codigo,
      descripcion: descripcion,
      codigo_barra: codigoBarra,
      precio: precio,
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
    console.log(error)
    return res.status(401).json({ msg: error.message });
  }
};

const eliminarArticulo = async (req, res) => {
  if (!req.params) {
    return res.status(500).json({ msg: "No se envió ningún id" });
  }

  const id = Number(req.params.id);
  try {
    const respuesta = await Articulo.destroy({
      where: {
        id: id,
      },
    });
    return res.json({ msg: "Artículo eliminado correctamente", respuesta });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

export {
  altaExcelArticulo,
  altaArticulo,
  editarArticulo,
  listadoArticulo,
  eliminarArticulo,
};
