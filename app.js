const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mysql = require('mysql2');
const web3 = require('@solana/web3.js');
const config = require('./config');
const path = require('path');
const fs = require('fs');
const CardController = require('./controllercards');
const MenuController = require('./controllermenu');

class App {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIO(this.server);
        this.cardController = new CardController();
        this.menuController = new MenuController();
        
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

        // CORS configuration
        this.app.use((req, res, next) => {
            const allowedOrigins = [
                'https://prismsol.xyz',
                'https://prismsol.xyz/click',
                'http://localhost:3000'  // For the local development
            ];
            
            const origin = req.headers.origin;
            if (allowedOrigins.includes(origin)) {
                res.header('Access-Control-Allow-Origin', origin);
                res.header('Access-Control-Allow-Headers', 
                    'Origin, X-Requested-With, Content-Type, Accept, X-Wallet-Address');
                res.header('Access-Control-Expose-Headers', 'X-Wallet-Address');
            }
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
            console.log('Client connected:', socket.id);

            // Gestion of the wallet initialization
            socket.on('wallet:init', (data) => {
                console.log('Wallet initialized:', data.address);
                socket.walletData = data;
            });

            // Gestion of the wallet connection
            socket.on('wallet:connected', (data) => {
                console.log('Wallet connected:', data.address);
                socket.walletData = data;
            });

            // Gestion of the wallet change
            socket.on('wallet:changed', (data) => {
                console.log('Wallet changed:', data);
                // Inform the other components of the server
                this.menuController.handleWalletChange(data);
            });

            // Periodic wallet verification
            const verifyInterval = setInterval(() => {
                if (socket.walletData) {
                    socket.emit('wallet:verify');
                }
            }, 5000); // Verify every 5 seconds

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
                clearInterval(verifyInterval);
            });
        });
    }

    initializeRoutes() {
        // 1. API routes first
        this.app.use('/click/api/cards', this.cardController.getRouter());
        this.app.use('/click/api/menu', this.menuController.getRouter());

        // 2. Route for main.css
        this.app.get('/main.css', (req, res) => {
            res.setHeader('Content-Type', 'text/css');
            res.sendFile('main.css', { root: path.join(__dirname, 'public') });
        });

        // 3. Route catch-all for /click in last
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
