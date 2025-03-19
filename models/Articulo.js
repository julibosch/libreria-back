import Sequelize from "sequelize";
import db from "../config/db.js";
import Proveedor from "./Proveedor.js";
import TipoArticulo from "./TipoArticulo.js"; // Importamos el modelo de tipo de artículos

const Articulo = db.define(
  "articulos",
  {
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
      type: Sequelize.STRING,
    },
    stock: {
      type: Sequelize.INTEGER,
    },
    id_tipoArticuloFK: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    id_proveedorFK: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: Proveedor,
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

export default Articulo;
