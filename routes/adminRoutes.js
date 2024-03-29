import express from 'express';
import { altaTipoArticulo, listadoTipoArticulo, editarTipoArticulo, altaTipoArticuloExcel, eliminarTipoArticulo } from '../controllers/tipoArticuloController.js';
import { altaExcelArticulo, altaArticulo, editarArticulo, listadoArticulo, eliminarArticulo, articuloExcelEditar, actualizarPrecios, buscarCodigoBarra, generarPDF, backupManuales } from '../controllers/articuloController.js';

const router = express.Router();

// Articulos
router.post('/articuloExcel', altaExcelArticulo);
router.post('/articulo', altaArticulo);
router.post('/articulo/actualizar-precio', actualizarPrecios);
router.post('/articulo/buscar-codigo-barra', buscarCodigoBarra);
router.put('/articulo/:codigo', editarArticulo);
router.put('/articuloExcelEditar', articuloExcelEditar);
router.get('/articulo', listadoArticulo);
router.delete('/articulo/:codigo_buscador', eliminarArticulo);
router.post('/generarPDF', generarPDF);
router.get('/backup-manuales', backupManuales); // Ruta para articulos dados de alta manualmente

// Tipos de Articulo
router.post('/tipos-de-articulo', altaTipoArticulo);
router.post('/tipos-de-articulo-excel', altaTipoArticuloExcel);
router.get('/tipos-de-articulo', listadoTipoArticulo);
router.put('/tipos-de-articulo/:id', editarTipoArticulo);
router.delete('/tipos-de-articulo/:id', eliminarTipoArticulo);

// Proveedores

export default router;