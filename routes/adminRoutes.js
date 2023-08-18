import express from 'express';
import { altaTipoArticulo, listadoTipoArticulo, editarTipoArticulo, altaTipoArticuloExcel, eliminarTipoArticulo } from '../controllers/tipoArticuloController.js';
import { altaExcelArticulo, altaArticulo, editarArticulo, listadoArticulo, eliminarArticulo } from '../controllers/articuloController.js';

const router = express.Router();

// Articulos
router.post('/articuloExcel', altaExcelArticulo);
router.post('/articulo', altaArticulo);
router.put('/articulo/:id', editarArticulo);
router.get('/articulo', listadoArticulo);
router.delete('/articulo/:id', eliminarArticulo);

// Tipos de Articulo
router.post('/tipos-de-articulo', altaTipoArticulo);
router.post('/tipos-de-articulo-excel', altaTipoArticuloExcel);
router.get('/tipos-de-articulo', listadoTipoArticulo);
router.put('/tipos-de-articulo/:id', editarTipoArticulo);
router.delete('/tipos-de-articulo/:id', eliminarTipoArticulo);

// Proveedores

export default router;