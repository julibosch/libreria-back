import { Op } from "sequelize";
import db from "./config/db.js";
import Articulo from "./models/Articulo.js";
import Proveedor from "./models/Proveedor.js";

// Función para extraer el prefijo del código
const obtenerPrefijo = (codigo) => {
  if (!codigo) return null;

  // Si el código NO tiene letras, pertenece a "Paraná"
  if (!/[a-zA-Z]/.test(codigo)) {
    return "PARANA";
  }

  // Extrae solo letras al inicio del código
  const match = codigo.match(/^[a-zA-Z]+/);
  return match ? match[0].toUpperCase() : null;
};

const asignarProveedores = async () => {
  try {
    console.log("🔄 Iniciando asignación de proveedores...");

    // Obtener todos los artículos
    const articulos = await Articulo.findAll();

    for (const articulo of articulos) {
      const prefijo = obtenerPrefijo(articulo.codigo_buscador);

      if (!prefijo) continue; // Si no tiene prefijo, pasamos al siguiente artículo

      // Buscar si el proveedor ya existe (incluyendo "Paraná")
      let proveedor = await Proveedor.findOne({
        where: { descripcion: prefijo },
      });

      // Si no existe, lo creamos
      if (!proveedor) {
        proveedor = await Proveedor.create({ descripcion: prefijo });
        console.log(`✅ Proveedor creado: ${prefijo}`);
      }

      // Asignar el proveedor al artículo
      await Articulo.update(
        { id_proveedorFK: proveedor.id },
        { where: { id: articulo.id } }
      );

      console.log(`🔄 Artículo ${articulo.codigo_buscador} asignado a proveedor ${prefijo}`);
    }

    console.log("✅ Proceso completado con éxito.");
  } catch (error) {
    console.error("❌ Error al asignar proveedores:", error);
  } finally {
    await db.close();
  }
};

// Ejecutar script
asignarProveedores();
