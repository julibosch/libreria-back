import express from 'express';
import { altaTipoArticulo } from '../controllers/tipoArticuloController.js';

const router = express.Router();

// Articulos


// Tipos de Articulo
router.post('/tipos-de-articulo', altaTipoArticulo);

// Proveedores

export default router;