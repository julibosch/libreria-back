import Articulo from "../models/Articulo.js";
import Proveedor from "../models/Proveedor.js";

const listadoProveedor = async (req, res) => {
  try {
    const proveedores = await Proveedor.findAll({
      order: [["descripcion", "ASC"]],
    });
    return res.json(proveedores);
  } catch (error) {
    return res
      .status(500)
      .json({ msg: "Error en el servidor", error: error.message });
  }
};

const altaProveedor = async (req, res) => {
  const { descripcion } = req.body;

  if (!descripcion || descripcion.trim() === "") {
    return res.status(400).json({ msg: "La descripción es obligatoria." });
  }

  try {
    // Verificar si el proveedor ya existe
    const proveedorExistente = await Proveedor.findOne({
      where: { descripcion },
    });

    if (proveedorExistente) {
      return res.status(409).json({ msg: "El proveedor ya existe." });
    }

    // Crear el proveedor
    const nuevoProveedor = await Proveedor.create({ descripcion });
    return res.status(201).json({
      proveedor: nuevoProveedor,
      msg: "Proveedor creado correctamente",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: "Error en el servidor", error: error.message });
  }
};

// ✅ Edición de proveedor con validaciones
const editarProveedor = async (req, res) => {
  const { id } = req.params;
  const { descripcion } = req.body;

  if (!descripcion || descripcion.trim() === "") {
    return res.status(400).json({ msg: "La descripción es obligatoria." });
  }

  try {
    // Verificar si el proveedor existe
    const proveedor = await Proveedor.findByPk(id);
    if (!proveedor) {
      return res.status(404).json({ msg: "Proveedor no encontrado." });
    }

    // Evitar actualizar si el nombre no cambió
    if (proveedor.descripcion === descripcion) {
      return res.status(400).json({ msg: "No se realizaron cambios." });
    }

    // Verificar si ya existe un proveedor con la nueva descripción
    const proveedorExistente = await Proveedor.findOne({
      where: { descripcion },
    });

    if (proveedorExistente) {
      return res
        .status(409)
        .json({ msg: "Ya existe un proveedor con ese nombre." });
    }

    // Actualizar el proveedor
    await proveedor.update({ descripcion });

    return res.json({
      proveedor,
      msg: "Proveedor editado correctamente.",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: "Error en el servidor", error: error.message });
  }
};

const eliminarProveedor = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ msg: "No se envió un ID válido." });
  }

  try {
    // 1️⃣ Verificar si el proveedor existe
    const proveedor = await Proveedor.findByPk(id);
    if (!proveedor) {
      return res.status(404).json({ msg: "Proveedor no encontrado." });
    }

    // 2️⃣ Verificar si el proveedor tiene artículos asociados
    const articulosRelacionados = await Articulo.count({
      where: { id_proveedorFK: id },
    });

    if (articulosRelacionados > 0) {
      return res.status(400).json({
        msg: "No se puede eliminar el proveedor porque tiene artículos asociados.",
      });
    }

    // 3️⃣ Eliminar el proveedor si no tiene artículos
    await proveedor.destroy();
    return res.json({ msg: "Proveedor eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar proveedor:", error);
    return res
      .status(500)
      .json({ msg: "Error en el servidor", error: error.message });
  }
};

export { altaProveedor, listadoProveedor, editarProveedor, eliminarProveedor };
