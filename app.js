const dotenv = require('dotenv');
dotenv.config()
const express = require('express');
const session = require('express-session');
const readdirSync = require('fs').readdirSync;
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const log = require('./config/logger');



const app = express();

// database connection
const connectDB = require('./config/database');

// test database connection
connectDB();

// set cookie parser with 7 days expiration
app.use(cookieParser());


// session
app.use(session
({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

//middlewares
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

// landing route
app.get('/', (req, res) => {
    res.status(200).json({ success: true, message: 'Welcome to the Intergral Test' });
});

//routes using readdir to read all the files in the routes folder and import them
readdirSync('./routes').map((r) => app.use('/api', require('./routes/' + r)));

const port = process.env.PORT || 3000;
const host = process.env.HOST || '127.0.0.1';
const env = process.env.NODE_ENV || 'development'

// start server
log.info(`🚀 Server is starting in ${env} mode...`)

app.listen(port, () => {
    log.info(`🚀 Server is running on http://${host}:${port}`);
});