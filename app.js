const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mysql = require('mysql2');
const web3 = require('@solana/web3.js');
const config = require('./config');
const path = require('path');
const fs = require('fs');
const CardController = require('./controllercards');

class App {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIO(this.server);
        this.cardController = new CardController();
        
        // Configuration du logging
        this.logStream = fs.createWriteStream(path.join(__dirname, 'passenger.log'), { flags: 'a' });
        
        this.initializeMiddlewares();
        this.initializeDatabase();
        this.initializeSocketIO();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    initializeMiddlewares() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        
        // Logging middleware
        this.app.use((req, res, next) => {
            const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;
            this.logStream.write(logMessage);
            console.log(logMessage);
            next();
        });

        // CORS headers
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        });

        // Static files
        this.app.use('/click', express.static(path.join(__dirname, 'public')));
    }

    initializeDatabase() {
        this.db = mysql.createConnection(config.database);
        this.db.connect((err) => {
            if (err) {
                console.error('Database connection error:', err);
                return;
            }
            console.log('Connected to MySQL database');
        });
    }

    initializeSocketIO() {
        this.io.on('connection', (socket) => {
            console.log('A client has connected');
            socket.on('disconnect', () => {
                console.log('A client has disconnected');
            });
        });
    }

    initializeRoutes() {
        // 1. Routes API en premier
        this.app.use('/click/api/cards', this.cardController.getRouter());

        // 2. Route pour main.css
        this.app.get('/main.css', (req, res) => {
            res.setHeader('Content-Type', 'text/css');
            res.sendFile('main.css', { root: path.join(__dirname, 'public') });
        });

        // 3. Route catch-all pour /click en dernier
        this.app.get('/click/*', (req, res) => {
            res.sendFile('index.html', { root: path.join(__dirname, 'public') });
        });
    }

    initializeErrorHandling() {
        this.app.use((err, req, res, next) => {
            const errorMessage = `[${new Date().toISOString()}] ERROR: ${err.stack}\n`;
            this.logStream.write(errorMessage);
            console.error(errorMessage);
            res.status(500).json({
                message: 'An error has occurred',
                error: process.env.NODE_ENV === 'development' ? err : {}
            });
        });
    }

    start() {
        const PORT = config.server.port;
        this.server.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    }
}

// Creation and starting of the application
const application = new App();
application.start();

module.exports = application;
