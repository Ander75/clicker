// Import the MenuRenderer class
class FrontMenu {
    constructor() {
        this.menuContainer = document.getElementById('menu-container');
        this.init();
    }

    async init() {
        try {
            const response = await fetch('/click/api/menu');
            const menuData = await response.json();
            this.render(menuData);
        } catch (error) {
            console.error('Error loading menu:', error);
        }
    }

    render(menuData) {
        // Inject styles
        const styleSheet = document.createElement("style");
        styleSheet.textContent = menuData.styles;
        document.head.appendChild(styleSheet);

        // Inject HTML
        let html = menuData.html;
        html = html.replace('{{logo}}', menuData.logo);
        this.menuContainer.innerHTML = html;

        this.initializeEventListeners();
    }

    async initializeEventListeners() {
        const connectWalletBtn = document.querySelector('.connect-wallet-btn');
        connectWalletBtn.addEventListener('click', async () => {
            try {
                // Vérifier si Phantom est disponible
                if (!window.phantomWallet) {
                    throw new Error("Phantom wallet is not initialized!");
                }

                const result = await window.phantomWallet.connectWallet();
                console.log('Wallet connected:', result.address);
                
                // Update the UI if necessary
                connectWalletBtn.textContent = 'CONNECTED';
                connectWalletBtn.style.background = '#90EE90';
                
            } catch (error) {
                console.error('Error connecting wallet:', error);
                connectWalletBtn.textContent = 'ERROR CONNECTING';
                connectWalletBtn.style.background = '#FFB6C1';
            }
        });
    }
}

// Initialize the front menu when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.frontMenu = new FrontMenu();
});
