import express from 'express';
import { autenticarUsuario } from '../controllers/usuarioController.js'

const router = express.Router();

router.post('/login', autenticarUsuario);

export default router;