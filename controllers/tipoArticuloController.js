import TipoArticulo from "../models/TipoArticulo.js";

const altaTipoArticulo = async (req, res) => {
  const { descripcion } = req.body;

  try {
    const respuesta = await TipoArticulo.create({ descripcion });
    return res.json({respuesta, msg:"Tipo artículo creado correctamente"});
  } catch (error) {
    console.error('Error al crear el tipo de artículo:', error);
    return res.status(401).json({ msg: error.message });
  }
};

const listadoTipoArticulo = async (req, res) => {
  try {
    const respuesta = await TipoArticulo.findAll();
    res.json(respuesta);
  } catch (error) {
    return res.status(401).json({ msg: error.message });
  }
}

const editarTipoArticulo = async (req, res) => {

  const { id } = req.params;
  let tipoArticulo;
  try {
    const { dataValues } = await TipoArticulo.findByPk(id);
    tipoArticulo = dataValues;
  } catch (error) {
    return res.status(500).json({msg: "Problema de conexión, intentelo nuevamente"});
  }

  if (!tipoArticulo) {
    return res.status(404).json({msg: "Tipo de articulo no encontrado"});
  }

  //Actualizo el objeto que viene de la base de datos, con el del body
  tipoArticulo.descripcion = req.body.descripcion || tipoArticulo.descripcion;
  
  try {
    const tipoArticuloActualizado = await TipoArticulo.update({
      descripcion: tipoArticulo.descripcion
    },{
      where: {
        id: id
      }
    });
    console.log(tipoArticuloActualizado)
  } catch (error) {
    
  }
}

export { 
  altaTipoArticulo,
  listadoTipoArticulo,
  editarTipoArticulo
}