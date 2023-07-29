import Usuario from "../models/Usuario.js";

const autenticarUsuario = async (req, res) => {
  console.log(req.body)

  const { nombre, contrasenia } = req.body;

   //Consultar si existe el socio en la base de datos
   const usuarioEncontrado = await Usuario.findOne({
    where: {
      nombre,
      contrasenia
    },
    attributes: ['nombre', 'contrasenia']
  });
  
  if (!usuarioEncontrado) {
    const error = new Error("El usuario no existe");
    return res.status(401).json({ msg: error.message });
  }
  return res.send(usuarioEncontrado.dataValues);
}

export {
  autenticarUsuario
}