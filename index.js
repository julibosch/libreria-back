import express from 'express';
import dotenv from 'dotenv';
import db from './config/db.js'
import cors from 'cors';
import usuarioRoutes from './routes/usuarioRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

dotenv.config();

//Conectar base de datos
db.authenticate()
  .then(() => console.log("base de datos conectada con exito"))
  .catch(error => console.log(error))
;

//Configuracion para Cors
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));

app.use("/", usuarioRoutes);
app.use("/admin", adminRoutes);

// Configura el tiempo de espera en 60 segundos (60000 milisegundos)
app.timeout = 60000;

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor funcionando en la URL: ${process.env.DB_HOST}:${PORT}`);
});

