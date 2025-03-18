import express from "express";
import dotenv from "dotenv";
import db from "./config/db.js";
import cors from "cors";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

dotenv.config();

//Conectar base de datos
const conectarDB = async () => {
  try {
    await db.authenticate();
    db.sync({ alter: true }); // agregar {alter: true} si quiero modificar la tabla desde el modelo
    console.log("Conexion exitosa a la base de datos");
  } catch (error) {
    console.log(`error al conectar db ${error}`);
  }
};
conectarDB();

//Configuracion para Cors
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

app.use("/", usuarioRoutes);
app.use("/admin", adminRoutes);

// Configura el tiempo de espera en 60 segundos (60000 milisegundos)
app.timeout = 60000;

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor funcionando en la URL: ${process.env.DB_HOST}:${PORT}`);
});
