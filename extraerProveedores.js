import { Op } from "sequelize";
import db from "./config/db.js";
import Articulo from "./models/Articulo.js";
import Proveedor from "./models/Proveedor.js";

// Función para extraer el prefijo del código (proveedor)
const obtenerProveedor = (codigo) => {
  if (!codigo) return null;

  // Si el código NO tiene letras, pertenece a "Paraná"
  if (!/[a-zA-Z]/.test(codigo)) {
    return "PARANA";
  }

  // Extrae solo letras al inicio del código
  const match = codigo.match(/^[a-zA-Z]+/);
  return match ? match[0].toUpperCase() : null;
};

const extraerProveedores = async () => {
  try {
    console.log("🔄 Iniciando extracción de proveedores...");

    // Obtener todos los códigos únicos de los artículos
    const articulos = await Articulo.findAll({
      attributes: ["codigo_buscador"],
    });

    // Crear un Set para guardar proveedores únicos
    const proveedoresSet = new Set(["PARANA"]); // Agregar "Paraná" desde el inicio

    for (const articulo of articulos) {
      const proveedor = obtenerProveedor(articulo.codigo_buscador);
      if (proveedor) {
        proveedoresSet.add(proveedor);
      }
    }

    // Convertir a array y ordenar
    const proveedoresUnicos = [...proveedoresSet].sort();
    console.log(`📌 Proveedores detectados: ${proveedoresUnicos.join(", ")}`);

    // Insertar proveedores en la base de datos si no existen
    for (const nombreProveedor of proveedoresUnicos) {
      const existe = await Proveedor.findOne({
        where: { descripcion: nombreProveedor },
      });
      if (!existe) {
        await Proveedor.create({ descripcion: nombreProveedor });
        console.log(`✅ Proveedor insertado: ${nombreProveedor}`);
      } else {
        console.log(`⚠ Proveedor ya existe: ${nombreProveedor}`);
      }
    }

    console.log("✅ Proceso de inserción de proveedores completado.");
  } catch (error) {
    console.error("❌ Error al extraer e insertar proveedores:", error);
  } finally {
    await db.close();
  }
};

// Ejecutar script
extraerProveedores();
