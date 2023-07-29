import express from 'express';
import { altaTipoArticulo, listadoTipoArticulo } from '../controllers/tipoArticuloController.js';

const router = express.Router();

// Articulos


// Tipos de Articulo
router.post('/tipos-de-articulo', altaTipoArticulo);
router.get('/tipos-de-articulo', listadoTipoArticulo);

// Proveedores

export default router;