import Sequelize from "sequelize";
import db from "../config/db.js";

const Proveedor = db.define("proveedores", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  descripcion: {
    type: Sequelize.STRING,
    unique: true,
  },
});

export default Proveedor;
