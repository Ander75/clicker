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
        if (!connectWalletBtn) return;

        if (isConnected) {
            // Format the address to show only first and last characters
            const shortAddress = address ? 
                `${address.slice(0, 4)}...${address.slice(-4)}` : '';

            // Connected state with dropdown menu
            connectWalletBtn.innerHTML = `
                <img src="/click/imgs/phantom.svg" alt="Phantom" style="
                    height: 24px;
                    width: 24px;
                    filter: invert(1) brightness(0.3);
                ">
                <div class="wallet-dropdown" style="display: none;">
                    <div class="dropdown-item address-item">
                        <span>${shortAddress}</span>
                    </div>
                    <div class="dropdown-item profile-item">
                        <img src="/click/imgs/profile.svg" alt="Profile">
                        Profile
                    </div>
                    <div class="dropdown-item disconnect-item">
                        <img src="/click/imgs/disconnect.svg" alt="Disconnect">
                        Disconnect
                    </div>
                </div>
            `;
            connectWalletBtn.style.background = '#90EE90';
            connectWalletBtn.style.padding = '8px';
            
            // Add dropdown functionality
            const dropdown = connectWalletBtn.querySelector('.wallet-dropdown');
            connectWalletBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
            });

            // Handle dropdown items
            const disconnectItem = connectWalletBtn.querySelector('.disconnect-item');
            disconnectItem.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (window.phantomWallet) {
                    await window.phantomWallet.disconnect();
                    this.updateButtonState(false);
                }
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                dropdown.style.display = 'none';
            });
        } else {
            // in disconnected state
            connectWalletBtn.innerHTML = `
                <img src="/click/imgs/phantom.svg" alt="Phantom" style="
                    height: 24px;
                    width: 24px;
                    filter: invert(1) brightness(0.3);
                ">
            `;
            connectWalletBtn.style.background = '#fff0f0';
            connectWalletBtn.style.padding = '8px'; // Adjusted padding for icon only
        }

        // Common styles for the button
        connectWalletBtn.style.display = 'flex';
        connectWalletBtn.style.alignItems = 'center';
        connectWalletBtn.style.justifyContent = 'center';

        // Modify the styles to ensure proper z-index layering
        if (!document.querySelector('#wallet-dropdown-styles')) {
            const styleSheet = document.createElement("style");
            styleSheet.id = 'wallet-dropdown-styles';
            styleSheet.textContent = `
                .menu-container {
                    position: relative;
                    z-index: 2000; /* Ensure menu container is above cards */
                }
                
                .connect-wallet-btn {
                    position: relative;
                    z-index: 2001; /* Button above menu container */
                }

                .wallet-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 8px;
                    background: #fff;
                    border: 2px solid #b18597;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    z-index: 2002; /* Dropdown above everything */
                    min-width: 180px;
                    transform-style: preserve-3d;
                    transform: translateZ(0);
                }
                .dropdown-item {
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    font-family: 'Inter', sans-serif;
                    transition: background 0.2s;
                }
                .dropdown-item:first-child {
                    border-radius: 8px 8px 0 0;
                }
                .dropdown-item:last-child {
                    border-radius: 0 0 8px 8px;
                }
                .dropdown-item:hover {
                    background: #ffe9e9;
                }
                .dropdown-item img {
                    width: 16px;
                    height: 16px;
                    filter: invert(1) brightness(0.3);
                }
                .address-item {
                    border-bottom: 1px solid #b18597;
                    color: #666;
                    font-size: 0.9em;
                    justify-content: center;
                    cursor: default;
                }
                .address-item:hover {
                    background: none;
                }
            `;
            document.head.appendChild(styleSheet);
        }
    }

    setupEventListeners() {
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

            // Only try to connect if not already connected
            if (!window.phantomWallet.isConnected()) {
                const result = await window.phantomWallet.connectWallet();
                this.updateButtonState(true, result.address);
            }
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
