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
            this.setupEventListeners();
            this.checkInitialConnectionState();
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

    // Nouvelle méthode pour vérifier l'état initial
    checkInitialConnectionState() {
        if (window.phantomWallet?.isConnected()) {
            const address = window.phantomWallet.getWalletAddress();
            this.updateButtonState(true, address);
        }
    }

    // New method to update the button state
    updateButtonState(isConnected, address = '') {
        const connectWalletBtn = document.querySelector('.connect-wallet-btn');
        if (isConnected) {
            // Display a short version of the address
            const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;
            connectWalletBtn.textContent = `CONNECTED: ${shortAddress}`;
            connectWalletBtn.style.background = '#90EE90';
        } else {
            connectWalletBtn.textContent = 'CONNECT WALLET';
            connectWalletBtn.style.background = '#fff0f0';
        }
    }

    setupEventListeners() {
        // Listen for wallet errors
        window.addEventListener('walletError', (event) => {
            const { type, message } = event.detail;
            console.error('Wallet error:', message);
            
            const connectWalletBtn = document.querySelector('.connect-wallet-btn');
            
            switch(type) {
                case 'wallet_changed':
                    connectWalletBtn.textContent = 'WALLET CHANGED - RECONNECT';
                    connectWalletBtn.style.background = '#ffcccc';
                    break;
                default:
                    connectWalletBtn.textContent = 'ERROR - RECONNECT';
                    connectWalletBtn.style.background = '#ffcccc';
            }
        });

        // Listen for wallet state changes
        window.addEventListener('walletConnectionChanged', (event) => {
            const { connected, address } = event.detail;
            this.updateButtonState(connected, address);
        });

        // Handle button click
        const connectWalletBtn = document.querySelector('.connect-wallet-btn');
        if (connectWalletBtn) {
            connectWalletBtn.addEventListener('click', this.handleWalletConnection.bind(this));
        }
    }

    async handleWalletConnection() {
        try {
            if (!window.phantomWallet) {
                throw new Error("Phantom wallet is not initialized!");
            }

            const result = await window.phantomWallet.connectWallet();
            this.updateButtonState(true, result.address);
        } catch (error) {
            console.error('Error connecting wallet:', error);
            this.updateButtonState(false);
        }
    }
}

// Initialize the front menu when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.frontMenu = new FrontMenu();
});
