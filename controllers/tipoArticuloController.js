import TipoArticulo from "../models/TipoArticulo.js";

const altaTipoArticulo = async (req, res) => {
  const { descripcion } = req.body;

  try {
    const respuesta = await TipoArticulo.create({ descripcion });
    return res.json({respuesta, msg:"Tipo artículo creado correctamente"});
  } catch (error) {
    
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
//!Consultar si validar que no se pueda tener dos tiposArticulos con el mismo nombre.
const editarTipoArticulo = async (req, res) => {
  const { id } = req.params;
  let tipoArticulo; //Contiene el objeto que viene de la bd.

  try {
    const { dataValues } = await TipoArticulo.findByPk(id);
    tipoArticulo = dataValues;
  } catch (error) {
    return res.status(500).json({msg: error.message});
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
        id: Number(tipoArticulo.id)
      }
    });
    
    // Comprobamos si se actualizó algún registro y devolvemos un objeto con dos propiedades, msg y tipo.
    if (tipoArticuloActualizado > 0) {
      return res.json({ msg: "Tipo de artículo actualizado exitosamente", tipo: { id, descripcion: tipoArticulo.descripcion }});
    }

    return res.status(300).json({ msg: "Nombre ya existente" });
    
  } catch (error) {
    return res.status(401).json({ msg: error.message});
  }
}

export { 
  altaTipoArticulo,
  listadoTipoArticulo,
  editarTipoArticulo
}