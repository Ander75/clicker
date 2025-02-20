const express = require('express');
const router = express.Router();

class CardController {
    constructor() {
        this.router = router;
        this.initializeRoutes();
    }

    initializeRoutes() {
        // Route pour obtenir une carte
        this.router.get('/card', (req, res) => {
            res.json({ status: 'success', message: 'Card route accessed' });
        });

        // Route pour créer une nouvelle carte
        this.router.post('/card', (req, res) => {
            res.json({ status: 'success', message: 'New card created' });
        });
    }

    getRouter() {
        return this.router;
    }
}

module.exports = CardController;
