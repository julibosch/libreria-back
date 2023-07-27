import Sequelize  from "sequelize";
import db from '../config/db.js';

const TipoArticulo = db.define('tipo_articulos', {
  descripcion: {
    type: Sequelize.STRING
  }
})

export default TipoArticulo;