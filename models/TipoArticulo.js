import Sequelize  from "sequelize";
import db from '../config/db.js';

const TipoArticulo = db.define('tipo_articulos', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  descripcion: {
    type: Sequelize.STRING
  }
})

export default TipoArticulo;