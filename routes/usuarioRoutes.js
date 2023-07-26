import express from 'express';
import { autenticarUsuario } from '../controllers/usuarioController.js'

const router = express.Router();

router.post('/', autenticarUsuario);

export default router;