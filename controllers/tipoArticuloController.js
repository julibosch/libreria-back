import TipoArticulo from "../models/TipoArticulo.js";

const altaTipoArticulo = async (req, res) => {
  const { descripcion } = req.body;

  try {
    const respuesta = await TipoArticulo.create({ descripcion });
    return res.json({ respuesta, msg: "Tipo artículo creado correctamente" });
  } catch (error) {
    return res.status(401).json({ msg: error.message });
  }
};

const altaTipoArticuloExcel = async (req, res) => {
  const tiposArticulos = req.body;
  
  if (tiposArticulos.length === 0) {
    return res.status(400).json({ msg: "No se envió ningun dato" });
  }

  const set = new Set(tiposArticulos.map((item) => item.familia)); //Mapea los datos pasandoselo a set, lo cual si hay un dato repetido, set no lo incluye
  const sinDuplicados = Array.from(set).map( familia => ({ descripcion: familia} )); // Lo transformamos nuevamente en un array y creamos propiedad descripcion, porque asi va en la bd.

  try {
    const respuesta = await TipoArticulo.bulkCreate(sinDuplicados); //Creamos descripcion porque en la base de datos esta asi.
    
    res.json({ msg: "Tipos de artículos creado correctamente" });
  } catch (error) {

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ msg: "Ya existen descripciones con ese nombre" });
    }

    return res.status(500).json({ msg: error.message });
  }
};

const listadoTipoArticulo = async (req, res) => {
  try {
    const respuesta = await TipoArticulo.findAll();
    res.json(respuesta);
  } catch (error) {
    return res.status(401).json({ msg: error.message });
  }
};

const editarTipoArticulo = async (req, res) => {
  const { id } = req.params;
  let tipoArticulo; //Contiene el objeto que viene de la bd.

  //Valida que no exista un tipo de articulo con esa descripcion. No se puede tener dos con la misma descripcion
  try {
    const tipoArticuloEncontrado = await TipoArticulo.findOne({
      where: {
        descripcion: req.body.descripcion,
      },
    });

    if (tipoArticuloEncontrado) {
      return res
        .status(500)
        .json({ msg: "Ya existe un tipo de artículo con ese nombre" });
    }
  } catch (error) {
    return res.status(404).json({ msg: error.message });
  }

  //Encontramos el tipo de articulo en la base de datos
  try {
    const { dataValues } = await TipoArticulo.findByPk(id);
    tipoArticulo = dataValues;
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }

  if (!tipoArticulo) {
    return res.status(404).json({ msg: "Tipo de articulo no encontrado" });
  }

  //Actualizo el objeto que viene de la base de datos, con el del body
  tipoArticulo.descripcion = req.body.descripcion || tipoArticulo.descripcion;

  try {
    const tipoArticuloActualizado = await TipoArticulo.update(
      {
        descripcion: tipoArticulo.descripcion,
      },
      {
        where: {
          id: tipoArticulo.id,
        },
      }
    );

    // Comprobamos si se actualizó algún registro y devolvemos un objeto con dos propiedades, msg y tipo.
    if (tipoArticuloActualizado > 0) {
      return res.json({
        msg: "Tipo de artículo actualizado exitosamente",
        tipo: { id, descripcion: tipoArticulo.descripcion },
      });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

export {
  altaTipoArticulo,
  listadoTipoArticulo,
  editarTipoArticulo,
  altaTipoArticuloExcel,
};
