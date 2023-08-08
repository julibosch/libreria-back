import Articulo from "../models/Articulo.js";

const altaExcelArticulo = async (req, res) => {
  const articulos = req.body;

  console.log(articulos);

  //!Falta validar los tipos de articulos, osea cambiar el nombre por el numero de primaryKey. Falta validar que todos tengan Tipo, consultar como haemos el alta de todos

  try {
    // Insertar los artículos en la base de datos utilizando bulkCreate
    const resultados = await Articulo.bulkCreate(articulos);
    console.log(resultados);

    res.status(200).json({ msg: "Artículos insertados con éxito" });
  } catch (error) {
    console.error("Error al insertar los artículos:", error);
    res.status(500).json({ msg: "Hubo un error al insertar los artículos" });
  }
};

const altaArticulo = async (req, res) => {
  let { descripcion, codigo_barra, precio, color, rubro, id_tipoArticuloFK } =
    req.body;

  if (!id_tipoArticuloFK) {
    return res.status(401).json({ msg: "Debe ingresar un tipo de artículo" });
  }

  id_tipoArticuloFK = 27; //Para que funque, hay que sacarlo.

  //! Falta mapear la familia, osea tipo de articulo al id que le corresponde
  try {
    const resultados = await Articulo.create({
      descripcion,
      codigo_barra,
      precio,
      color,
      rubro,
      id_tipoArticuloFK,
    });
    res.status(200).json({ msg: "Artículo creado con exito" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const editarArticulo = async (req, res) => {
  const { id } = req.params;
  let articulo; //Contiene el objeto que viene de la bd.

  try {
    const { dataValues } = await Articulo.findByPk(id);
    articulo = dataValues;
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }

  if (!articulo) {
    return res.status(404).json({ msg: "Artículo no encontrado" });
  }

  //! Acá iria el mapeo o consulta a base de datos.

  //Actualizo el objeto que viene de la base de datos, con el del body
  articulo.descripcion = req.body.descripcion || articulo.descripcion;
  articulo.codigo_barra = req.body.codigo_barra || articulo.codigo_barra;
  articulo.precio = req.body.precio || articulo.precio;
  articulo.color = req.body.color || articulo.color;
  articulo.rubro = req.body.rubro || articulo.rubro;
  // articulo.id_tipoArticuloFK = req.body.id_tipoArticuloFK || articulo.id_tipoArticuloFK; //Cambiar si es que viene como familia y mapear al id.
  articulo.id_tipoArticuloFK = 27; //Esto no va, va lo que esta comentado arriba

  try {
    const articuloActualizado = await Articulo.update(
      {
        descripcion: articulo.descripcion,
        codigo_barra: articulo.codigo_barra,
        precio: articulo.precio,
        color: articulo.color,
        rubro: articulo.rubro,
        id_tipoArticuloFK: articulo.id_tipoArticuloFK,
      },
      {
        where: {
          id: Number(articulo.id),
        },
      }
    );

    if (articuloActualizado > 0) {
      return res.json({ msg: "Artículo actualizado exitosamente" });
    }
    return res.status(300).json({ msg: "No hubo modificaciones" });

  } catch (error) {
    return res.status(401).json({ msg: error.message });
  }
};

export { altaExcelArticulo, altaArticulo, editarArticulo };
