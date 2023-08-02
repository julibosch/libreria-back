import express from 'express';
import { altaTipoArticulo, listadoTipoArticulo, editarTipoArticulo } from '../controllers/tipoArticuloController.js';

const router = express.Router();

// Articulos


// Tipos de Articulo
router.post('/tipos-de-articulo', altaTipoArticulo);
router.get('/tipos-de-articulo', listadoTipoArticulo);
router.put('/tipos-de-articulo/:id', editarTipoArticulo);

// Proveedores

export default router;