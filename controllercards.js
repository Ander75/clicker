const express = require('express');
const router = express.Router();
const CardService = require('./servicescards');

class CardController {
    constructor() {
        this.router = router;
        this.cardService = new CardService();
        this.initializeRoutes();
    }

    initializeRoutes() {
        // Route pour obtenir les cartes
        this.router.get('/card', (req, res) => {
            try {
                const result = this.cardService.getAllCards();
                res.json({ 
                    status: 'success',
                    data: result
                });
            } catch (error) {
                res.status(500).json({
                    status: 'error',
                    message: error.message
                });
            }
        });

        // Route to create a new card
        this.router.post('/card', (req, res) => {
            res.json({ status: 'success', message: 'New card created' });
        });
    }

    getRouter() {
        return this.router;
    }
}

module.exports = CardController;
