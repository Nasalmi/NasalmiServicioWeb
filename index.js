const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const apiRoutes = require('./api-routes');

const app = express();

const cors = require('cors');
app.use(cors());
const session = require('express-session');
const MongoStore = require('connect-mongo');

app.use(session({
    secret: 'frasesecretaparaquenonoseveancositas',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost/Nasalmi'
    }),
    cookie: { maxAge: 1800000 } // 30 minutos de duración de la cookie
}));



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api', apiRoutes);

// Conectar a MongoDB
mongoose.connect('mongodb://localhost/Nasalmi', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión:'));
db.once('open', function () {
  console.log("¡Conexión exitosa a la base de datos!");
});

app.listen(8080, () => {
  console.log('Servidor escuchando en el puerto 8080');
});


app.get('/', (req, res) => {
  res.send('Hola Bienvenidos al Servicio Web de Nasalmi');
});

app.use(express.static('public')); // Asume que 'public' es la carpeta donde está tu index.html y otros archivos estáticos.
