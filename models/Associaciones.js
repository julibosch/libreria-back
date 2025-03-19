import Articulo from "./Articulo.js";
import Proveedor from "./Proveedor.js";
import TipoArticulo from "./TipoArticulo.js";

// 🔹 Definir asociaciones (solo una vez por alias)
Articulo.belongsTo(TipoArticulo, {
  foreignKey: "id_tipoArticuloFK",
  as: "tipoArticulo",
});

Articulo.belongsTo(Proveedor, {
  foreignKey: "id_proveedorFK",
  as: "proveedor",
});

Proveedor.hasMany(Articulo, {
  foreignKey: "id_proveedorFK",
});

TipoArticulo.hasMany(Articulo, {
  foreignKey: "id_tipoArticuloFK",
});

// 🔹 Exportamos los modelos con sus asociaciones
export { Articulo, Proveedor, TipoArticulo };
