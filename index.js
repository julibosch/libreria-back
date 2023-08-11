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
  .then( () => console.log("base de datos conectada"))
  .catch( error => console.log(error))


//Configuracion para Cors
const dominiosPermitidos = [process.env.FRONTEND_URL,process.env.estefa_url];
const corsOptions = {
  origin: (origin,callback) => {
    if (dominiosPermitidos.indexOf(origin) !== -1) {
      callback(null,true)
    }else{
      callback(new Error("No permitido por cors"))
    }
  }
}

app.use(cors(corsOptions));

app.use("/", usuarioRoutes);
app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor funcando en el puerto: http://localhost:${PORT}`);
})

