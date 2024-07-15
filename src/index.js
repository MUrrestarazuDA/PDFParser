import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import cors from 'cors';
import router from "./routes/router.js"


const PORT = 3000;
/* dotenv.config();

const sessionConfig = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60
    }
}; */

const app = express();

 //app.use(session(sessionConfig));


 const corsOptions = {
  origin: ['https://innovative-systems.diselan.com/leboriz', 'http://localhost:5173'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.static("Public"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/", router);

app.listen(PORT, () => console.log("Servidor web en marcha en puerto 3000."));