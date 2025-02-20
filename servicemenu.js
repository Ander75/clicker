const MenuRenderer = require('./rendermenu');

class MenuService {
    constructor(io) {
        this.menuRenderer = new MenuRenderer();
        this.io = io;
    }

    handleWalletChange(data) {
        // Informer tous les clients du changement de wallet
        this.io.emit('wallet:stateChanged', {
            type: 'address_changed',
            message: 'Wallet address changed. Please reconnect.'
        });
    }

    async getMenuData() {
        const menuHTML = this.menuRenderer.getMenuHTML();
        return {
            logo: '/click/imgs/BLAST.svg',
            title: 'Menu Principal',
            html: menuHTML.template,
            styles: menuHTML.styles
        };
    }
}

module.exports = MenuService;
