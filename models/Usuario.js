import Sequelize  from "sequelize";
import db from '../config/db.js';

const Usuario = db.define('usuarios', {
  nombre: {
    type: Sequelize.STRING
  },
  contrasenia: {
    type: Sequelize.STRING
  }
})

export default Usuario;