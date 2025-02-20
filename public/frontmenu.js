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

    initializeEventListeners() {
        const connectWalletBtn = document.querySelector('.connect-wallet-btn');
        connectWalletBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/click/api/menu/connect-wallet', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ walletAddress: 'example_address' })
                });
                const result = await response.json();
                console.log('Wallet connection result:', result);
            } catch (error) {
                console.error('Error connecting wallet:', error);
            }
        });
    }
}

// Initialize the front menu when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.frontMenu = new FrontMenu();
});
