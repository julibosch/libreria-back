import Sequelize from "sequelize";
import db from "../config/db.js";
import Proveedor from "./Proveedor.js";

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
      references: {
        model: "tipo_articulos", // Nombre de la tabla referenciada
        key: "id", // Nombre de la columna referenciada en la tabla tipo_articulos
      },
    },
    id_proveedorFK: {
      type: Sequelize.INTEGER,
      references: {
        model: Proveedor,
        key: "id",
      },
      onDelete: "SET NULL", // O "CASCADE"
      onUpdate: "CASCADE",
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: true, // ✅ Permite valores NULL
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: true, // ✅ Permite valores NULL
    },
  },
  {
    timestamps: true,
  }
);

export default Articulo;
