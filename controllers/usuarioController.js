import Usuario from "../models/Usuario.js";

const autenticarUsuario = async (req, res) => {
  const nombreUsuario = req.body.nombre;
  //Consultar si existe el socio en la base de datos
  try {
    const respuesta = await Usuario.findOne({
      where: {
        nombre: nombreUsuario
      }
    });

    return res.json(respuesta);
  } catch (error) {
    return res.status(300).json({msg: error.message});
  }
}

export {
  autenticarUsuario
}