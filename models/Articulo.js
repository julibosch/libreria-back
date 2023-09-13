import Sequelize from "sequelize";
import db from "../config/db.js";

const Articulo = db.define("articulos", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  descripcion: {
    type: Sequelize.STRING,
  },
  codigo_barra: {
    type: Sequelize.STRING,
  },
  precio: {
    type: Sequelize.DECIMAL(18, 3),
  },
  color: {
    type: Sequelize.STRING,
  },
  codigo_buscador: {
    type: Sequelize.STRING
  },
  stock: {
    type: Sequelize.INTEGER
  },
  id_tipoArticuloFK: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: "tipo_articulos", // Nombre de la tabla referenciada
      key: "id", // Nombre de la columna referenciada en la tabla tipo_articulos
    },
  },
});

export default Articulo;
