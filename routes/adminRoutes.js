import express from 'express';
import { altaTipoArticulo, listadoTipoArticulo, editarTipoArticulo } from '../controllers/tipoArticuloController.js';
import { altaExcelArticulo, altaArticulo, editarArticulo } from '../controllers/articuloController.js';

const router = express.Router();

// Articulos
router.post('/articuloExcel', altaExcelArticulo);
router.post('/articulo', altaArticulo);
router.put('/articulo/:id', editarArticulo);

// Tipos de Articulo
router.post('/tipos-de-articulo', altaTipoArticulo);
router.get('/tipos-de-articulo', listadoTipoArticulo);
router.put('/tipos-de-articulo/:id', editarTipoArticulo);

// Proveedores

export default router;