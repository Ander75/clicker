const MenuRenderer = require('./rendermenu');

class MenuService {
    constructor() {
        this.menuRenderer = new MenuRenderer();
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
