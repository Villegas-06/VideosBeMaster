const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');

const config = require('./config/config');

const app = express();
const PORT = process.env.PORT || 3000

// Conexion a la base de datos MongoDB

mongoose.connect(config.mongoURI)
    .then(() => console.log("MongoDB Connection Successful"))
    .catch(err => console.error(err));

app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.text({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));

// SOCKET

let server = app.listen(PORT, () => {
    console.log('Server started on port ' + PORT);
})

// Create a socket port

let io = require('socket.io')(server);

// Declare global var og connection socket to use in other controllers

global.io = io;

app.use(cors({ origin: '*' }));

app.use(require('express-session')({
    secret: "config/config.js",
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize());
app.use(passport.session())
require('./config/passport')(passport)


app.get('/', (req, res) => {
    res.send('<h1>Server Running</h1>')
})


let router = express.Router();
app.use('/api', router);

require('./routes/api/user')(router);
require('./routes/api/video')(router);

