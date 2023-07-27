import TipoArticulo from "../models/TipoArticulo.js";

const altaTipoArticulo = async (req, res) => {
  const { descripcion } = req.body;

  try {
    const respuesta = await TipoArticulo.create({ descripcion });
    return res.json("Tipo artículo creado correctamente");
  } catch (error) {
    console.error('Error al crear el tipo de artículo:', error);
    return res.status(401).json({ msg: error.message });
  }
};

export { 
  altaTipoArticulo
}