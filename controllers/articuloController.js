import Articulo from "../models/Articulo.js";
import TipoArticulo from "../models/TipoArticulo.js";

const altaExcelArticulo = async (req, res) => {
  const articulos = req.body;
  console.log("first");
  console.log(articulos);
  return;

  //!Falta validar los tipos de articulos, osea cambiar el nombre por el numero de primaryKey. Falta validar que todos tengan Tipo, consultar como haemos el alta de todos

  try {
    // Insertar los artículos en la base de datos utilizando bulkCreate
    const resultados = await Articulo.bulkCreate(articulos);
    console.log(resultados);

    res.status(200).json({ msg: "Artículos insertados con éxito" });
  } catch (error) {
    res.status(500).json({ msg: "Hubo un error al insertar los artículos" });
  }
};

const altaArticulo = async (req, res) => {
  const { codigo, descripcion, precio, codigoBarra, tipoArticulo, stock, color } = req.body;
  let id = ""; //Va a contener el id del tipo de articulo

  if (!tipoArticulo) {
    return res.status(401).json({ msg: "Debe ingresar un tipo de artículo" });
  }

  //Nos traemos el id del tipo de articulo y ademas validamos que exista en la base de datos.
  try {
    const { dataValues } = await TipoArticulo.findOne({
      where: {
        descripcion: tipoArticulo,
      },
    });

    id = dataValues.id; //Le paso el id del tipo articulo a una variable global, porque sino no puedo usar datavalues por el scop

    if (!id) {
      return res.status(500).json({ msg: "No existe ese tipo de articulo" });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }

  try {
    const respuesta = await Articulo.create({
      codigo_buscador: codigo,
      descripcion,
      precio,
      codigo_barra: codigoBarra,
      id_tipoArticuloFK: id,
      stock,
      color,
    });
    return res.json({ respuesta, msg: "Artículo creado con exito" });
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

const listadoArticulo = async (req, res) => {
  const consultaSQL = `
    SELECT articulos.descripcion AS descripcion, articulos.id AS id, color, precio, codigo_buscador, codigo_barra, stock,
    tipo_articulos.descripcion AS tipoArticulo
    FROM articulos
    INNER JOIN tipo_articulos
    ON articulos.id_tipoArticuloFK = tipo_articulos.id;
  `;
  try {
   const respuesta = await Articulo.sequelize.query(consultaSQL, {
      type: Articulo.sequelize.QueryTypes.SELECT, // Tipo de consulta
      include: TipoArticulo, // Incluye el modelo TipoArticulo en la consulta
    });
    res.json(respuesta);
  } catch (error) {
    return res.status(401).json({ msg: error.message });
  }
};

export { altaExcelArticulo, altaArticulo, editarArticulo, listadoArticulo };
