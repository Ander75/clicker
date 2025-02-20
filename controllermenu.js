const express = require('express');
const MenuService = require('./servicemenu');

class MenuController {
    constructor() {
        this.router = express.Router();
        this.menuService = new MenuService();
        this.initializeRoutes();
    }

    initializeRoutes() {
        // GET menu data
        this.router.get('/', (req, res) => {
            this.menuService.getMenuData()
                .then(menuData => res.json(menuData))
                .catch(error => res.status(500).json({ error: error.message }));
        });

        // POST wallet connection
        this.router.post('/connect-wallet', (req, res) => {
            const { walletAddress } = req.body;
            this.menuService.handleWalletConnection(walletAddress)
                .then(result => res.json(result))
                .catch(error => res.status(500).json({ error: error.message }));
        });
    }

    getRouter() {
        return this.router;
    }
}

module.exports = MenuController;
