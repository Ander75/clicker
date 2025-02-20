const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mysql = require('mysql2');
const web3 = require('@solana/web3.js');
const config = require('./config'); // Import configuration
const path = require('path');
const fs = require('fs');

// Configuration du logging
const logStream = fs.createWriteStream(path.join(__dirname, 'passenger.log'), { flags: 'a' });

// Base middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;
    logStream.write(logMessage);
    console.log(logMessage); // Keep also the console output
    next();
});

// CORS headers configuration
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Serve static files
app.use('/', express.static(path.join(__dirname, 'public')));

// MySQL database configuration
const db = mysql.createConnection(config.database);

// Database connection
db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Socket.io configuration
io.on('connection', (socket) => {
    console.log('A client has connected');
    
    socket.on('disconnect', () => {
        console.log('A client has disconnected');
    });
});

// Route spécifique pour main.css
app.get('/main.css', (req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile('main.css', { root: path.join(__dirname, 'public') });
});

// Route pour toutes les autres requêtes - doit être APRÈS express.static
app.get('*', (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, 'public') });
});

// Gestion des erreurs avec logging
app.use((err, req, res, next) => {
    const errorMessage = `[${new Date().toISOString()}] ERROR: ${err.stack}\n`;
    logStream.write(errorMessage);
    console.error(errorMessage);
    res.status(500).json({
        message: 'Une erreur est survenue',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Server startup
const PORT = config.server.port;
http.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
