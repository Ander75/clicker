const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mysql = require('mysql2');
const web3 = require('@solana/web3.js');
const config = require('./config'); // Import configuration
const path = require('path');

// Middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware pour déboguer
app.use((req, res, next) => {
    console.log('Request URL:', req.url);
    next();
});

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// CORS headers configuration
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Route catch-all
app.get('*', (req, res) => {
    console.log('Serving index.html for path:', req.url);
    res.sendFile('index.html', { root: './public' });
});

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

// Server startup
const PORT = config.server.port;
http.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

// Global error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'A server error occurred',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});
